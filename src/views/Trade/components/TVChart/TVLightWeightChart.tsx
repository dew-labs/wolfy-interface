import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  LineStyle,
} from 'lightweight-charts'
import {memo, useEffect, useMemo, useRef} from 'react'
import {useLatest} from 'react-use'

import type {ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {
  CANDLE_STICK_SERIES,
  CANDLE_STICKS_TO_RIGHT_BORDER,
  CHART_STYLE,
  getChartWssUrl,
} from '@/lib/tvchart/constants.ts'
import fetchChartHistoryData from '@/lib/tvchart/services/fetchChartHistoryData.ts'
import {parseChartData} from '@/lib/tvchart/utils/binanceDataToChartData.ts'

const CHART_HEIGHT = 300

export default memo(function TVLightWeightChart(props: {
  asset: string
  textColor: string
  gridColor: string
  interval: ChartInterval
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi>()
  const chartMainCandlestickSeries = useRef<ISeriesApi<'Candlestick'>>()

  // NOTE: Unused?
  // CHART_STYLE.LINE_COLOR
  // CHART_STYLE.AREA_TOP_COLOR
  // CHART_STYLE.AREA_BOTTOM_COLOR

  const chartStyle = useMemo(
    () => ({
      layout: {
        background: {type: ColorType.Solid, color: CHART_STYLE.BACKGROUND_COLOR},
        textColor: props.textColor,
        fontFamily: 'Geist Mono',
      },
      grid: {
        vertLines: {
          color: props.gridColor,
          style: LineStyle.Dashed,
        },
        horzLines: {
          color: props.gridColor,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    }),
    [props.gridColor, props.textColor],
  )
  const latestChartStyle = useLatest(chartStyle)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
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

    void (async function updateChartWithHistoricalData() {
      const initialData = await fetchChartHistoryData(`${props.asset}usdt`, props.interval)
      if (!chartMainCandlestickSeries.current) return
      chartMainCandlestickSeries.current.setData(initialData)
      if (chartRef.current)
        chartRef.current.timeScale().scrollToPosition(CANDLE_STICKS_TO_RIGHT_BORDER, false)
    })()

    return () => {
      chart.remove()
    }
  }, [props.interval, props.asset])

  useEffect(
    function applyNewChartStyle() {
      if (!chartRef.current) return

      chartRef.current.applyOptions(chartStyle)
    },
    [chartStyle],
  )

  useEffect(
    function updateRealTimeData() {
      const wssUrl = getChartWssUrl(props.asset, props.interval)
      const chartDataWS = new WebSocket(wssUrl)

      const eventHandler = (event: MessageEvent<unknown>) => {
        if (!chartMainCandlestickSeries.current) return
        if (typeof event.data !== 'string') {
          return
        }

        const rawData = JSON.parse(event.data)
        const data = parseChartData(rawData, props.interval)

        if (data) {
          chartMainCandlestickSeries.current.update(data)
        }
      }

      chartDataWS.addEventListener('message', eventHandler)

      return () => {
        chartDataWS.removeEventListener('message', eventHandler)
      }
    },
    [props.interval, props.asset],
  )

  useEffect(function resizeChartWhenContainerResize() {
    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return
      chartRef.current.applyOptions({width: chartContainerRef.current.clientWidth})
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div ref={chartContainerRef} />
})
