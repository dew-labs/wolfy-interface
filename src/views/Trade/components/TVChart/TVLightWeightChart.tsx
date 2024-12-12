import {useQuery} from '@tanstack/react-query'
import {
  type ChartOptions,
  ColorType,
  createChart,
  type CreatePriceLineOptions,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  LineStyle,
} from 'lightweight-charts'
import {
  createContext,
  memo,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {useLatest} from 'react-use'
import {debounce} from 'remeda'
import invariant from 'tiny-invariant'
import type {PartialDeep} from 'type-fest'

import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import type {ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {isIntervalSmallerThan1D} from '@/lib/tvchart/chartdata/ChartData.ts'
import {
  CANDLE_STICK_SERIES,
  CANDLE_STICKS_TO_RIGHT_BORDER,
  CHART_STYLE,
  getChartWssUrl,
} from '@/lib/tvchart/constants.ts'
import fetchChartHistoryData from '@/lib/tvchart/services/fetchChartHistoryData.ts'
import {parseChartData} from '@/lib/tvchart/utils/binanceDataToChartData.ts'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

const CHART_HEIGHT = 300

function useChartHistoryData(asset: string, interval: ChartInterval) {
  return useQuery({
    queryKey: ['!chartHistoryData', asset, interval],
    queryFn: async () => fetchChartHistoryData(`${asset}usdt`, interval),
    ...NO_REFETCH_OPTIONS,
    refetchOnMount: true,
  })
}

interface ChartContextValue {
  createPriceLine: ((options: CreatePriceLineOptions) => IPriceLine) | null
  removePriceLine: ((line: IPriceLine) => void) | null
}

const ChartContext = createContext<ChartContextValue>({
  createPriceLine: null,
  removePriceLine: null,
})

interface LineProps {
  options: CreatePriceLineOptions
}

export const Line = memo(function Line({options}: LineProps) {
  const {createPriceLine, removePriceLine} = useContext(ChartContext)

  useEffect(() => {
    if (!createPriceLine || !removePriceLine) return

    const line = createPriceLine(options)

    return () => {
      removePriceLine(line)
    }
  }, [createPriceLine, removePriceLine, options])

  return null
})

interface TVLightWeightChartProps extends PropsWithChildren {
  asset: string
  textColor: string
  gridColor: string
  interval: ChartInterval
  children: ReactElement<LineProps> | ReactElement<LineProps>[]
}

export default memo(function TVLightWeightChart({
  asset,
  textColor,
  gridColor,
  interval,
  children,
}: TVLightWeightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const chartMainCandlestickSeries = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const {data: historicalData} = useChartHistoryData(asset, interval)

  const chartStyle = useMemo<PartialDeep<ChartOptions>>(
    () => ({
      layout: {
        background: {type: ColorType.Solid, color: CHART_STYLE.BACKGROUND_COLOR},
        textColor,
        fontFamily: 'Geist Mono',
      },
      grid: {
        vertLines: {
          color: gridColor,
          style: LineStyle.Dashed,
        },
        horzLines: {
          color: gridColor,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: isIntervalSmallerThan1D(interval),
        secondsVisible: false,
      },
    }),
    [gridColor, textColor, interval],
  )
  const latestChartStyle = useLatest(chartStyle)

  useEffect(function initChart() {
    const container = chartContainerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth,
      height: CHART_HEIGHT,
      ...latestChartStyle.current,
    })

    chartRef.current = chart

    chartMainCandlestickSeries.current = chartRef.current.addCandlestickSeries({
      upColor: CANDLE_STICK_SERIES.UP_COLOR,
      downColor: CANDLE_STICK_SERIES.DOWN_COLOR,
      borderVisible: CANDLE_STICK_SERIES.BORDER_VISIBLE,
      wickUpColor: CANDLE_STICK_SERIES.WICK_UP_COLOR,
      wickDownColor: CANDLE_STICK_SERIES.WICK_DOWN_COLOR,
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        chartMainCandlestickSeries.current = null
      }
    }
  }, [])

  useEffect(
    function updateChartData() {
      if (!historicalData) return
      if (!chartMainCandlestickSeries.current) return

      chartMainCandlestickSeries.current.setData(historicalData)

      chartRef.current?.timeScale().scrollToPosition(CANDLE_STICKS_TO_RIGHT_BORDER, false)
      chartMainCandlestickSeries.current.priceScale().applyOptions({
        autoScale: true,
      })
    },
    [historicalData],
  )

  useEffect(
    function applyNewChartStyle() {
      chartRef.current?.applyOptions(chartStyle)
    },
    [chartStyle],
  )

  useEffect(function updatePriceFormatter() {
    if (!chartRef.current) return
    chartRef.current.applyOptions({
      localization: {
        priceFormatter: (price: number) => price.toFixed(calculatePriceFractionDigits(price, 0)),
      },
    })
  }, [])

  useEffect(
    function updateRealTimeData() {
      const wssUrl = getChartWssUrl(asset, interval)
      const chartDataWS = new WebSocket(wssUrl)

      const eventHandler = (event: MessageEvent<unknown>) => {
        if (!chartMainCandlestickSeries.current) return

        if (typeof event.data !== 'string') {
          return
        }

        const rawData = JSON.parse(event.data)
        const data = parseChartData(rawData, interval)

        if (data) {
          chartMainCandlestickSeries.current.update(data)
        }
      }

      chartDataWS.addEventListener('message', eventHandler)

      return () => {
        chartDataWS.removeEventListener('message', eventHandler)
        chartDataWS.close()
      }
    },
    [interval, asset],
  )

  useEffect(function resizeChartWhenContainerResize() {
    const handleResize = debounce(
      () => {
        if (!chartContainerRef.current || !chartRef.current) return
        chartRef.current.applyOptions({width: chartContainerRef.current.clientWidth})
      },
      {
        waitMs: 100,
        maxWaitMs: 200,
      },
    )

    window.addEventListener('resize', handleResize.call)

    return () => {
      handleResize.cancel()
      window.removeEventListener('resize', handleResize.call)
    }
  }, [])

  const contextValue = useMemo<ChartContextValue>(
    () => ({
      createPriceLine: options => {
        invariant(chartMainCandlestickSeries.current, 'Chart series not initialized')
        return chartMainCandlestickSeries.current.createPriceLine(options)
      },
      removePriceLine: line => {
        chartMainCandlestickSeries.current?.removePriceLine(line)
      },
    }),
    [],
  )

  return (
    <ChartContext value={contextValue}>
      <div ref={chartContainerRef} />
      {children}
    </ChartContext>
  )
})
