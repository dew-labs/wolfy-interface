import type {
  CandlestickData,
  CandlestickSeriesPartialOptions,
  SeriesDataItemTypeMap,
  UTCTimestamp,
} from 'lightweight-charts'
import {ColorType, createChart, LineStyle} from 'lightweight-charts'
import React, {type LegacyRef, useEffect, useMemo, useRef} from 'react'

import type {ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {
  CANDLE_STICK_SERIES,
  CANDLE_STICKS_TO_RIGHT_BORDER,
  CHART_DATA_WS,
  CHART_STYLE,
} from '@/lib/tvchart/constants.ts'
import fetchChartHistoryData from '@/lib/tvchart/services/fetchChartHistoryData.ts'
import {parseChartData} from '@/lib/tvchart/utils/binanceDataToChartData.ts'

function TVLightWeightChart(props: {
  textColor: string
  gridColor: string
  interval: ChartInterval
}) {
  const chartStyle = useMemo(
    () => ({
      backgroundColor: CHART_STYLE.BACKGROUND_COLOR,
      lineColor: CHART_STYLE.LINE_COLOR,
      textColor: props.textColor,
      areaTopColor: CHART_STYLE.AREA_TOP_COLOR,
      areaBottomColor: CHART_STYLE.AREA_BOTTOM_COLOR,
      gridColor: props.gridColor,
    }),
    [props.textColor, props.gridColor],
  )

  const chartContainerRef = useRef<HTMLElement | string>('')

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {type: ColorType.Solid, color: chartStyle.backgroundColor},
        textColor: chartStyle.textColor,
      },
      grid: {
        vertLines: {
          color: chartStyle.gridColor,
          style: LineStyle.Dashed,
        },
        horzLines: {
          color: chartStyle.gridColor,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      width: (chartContainerRef.current as HTMLElement).clientWidth,
      height: 300,
    })
    const handleResize = () => {
      chart.applyOptions({width: (chartContainerRef.current as HTMLElement).clientWidth})
    }
    const newSeries = chart.addCandlestickSeries({
      upColor: CANDLE_STICK_SERIES.UP_COLOR,
      downColor: CANDLE_STICK_SERIES.DOWN_COLOR,
      borderVisible: CANDLE_STICK_SERIES.BORDER_VISIBLE,
      wickUpColor: CANDLE_STICK_SERIES.WICK_UP_COLOR,
      wickDownColor: CANDLE_STICK_SERIES.WICK_DOWN_COLOR,
    } as CandlestickSeriesPartialOptions)

    const fetchChartData = async () => {
      const initialData = await fetchChartHistoryData('ethusdt', props.interval)
      newSeries.setData(initialData as SeriesDataItemTypeMap<UTCTimestamp>['Candlestick'][])
      chart.timeScale().scrollToPosition(CANDLE_STICKS_TO_RIGHT_BORDER, false)

      const chartDataWS = new WebSocket(CHART_DATA_WS + props.interval)
      chartDataWS.onmessage = event => {
        if (typeof event.data !== 'string') {
          return
        }

        const binanceData = JSON.parse(event.data)

        if (binanceData) {
          newSeries.update(
            parseChartData(binanceData, props.interval) as CandlestickData<UTCTimestamp>,
          )
        }
      }

      window.addEventListener('resize', handleResize)
    }
    void fetchChartData()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [chartStyle, props.interval])

  return <div ref={chartContainerRef as LegacyRef<HTMLDivElement>} />
}

export default TVLightWeightChart
