import type {SeriesDataItemTypeMap, UTCTimestamp} from 'lightweight-charts'
import {ColorType, createChart, LineStyle} from 'lightweight-charts'
import React, {type LegacyRef, useEffect, useMemo, useRef} from 'react'

import type {ChartData, ChartInterval} from '@/lib/tvchart/datafeed/Datafeed.ts'
import binanaceDataToChartData, {
  type BinanceChartData,
} from '@/lib/tvchart/utils/binanceDataToChartData.ts'
import binanceHistoryDataToChartData from '@/lib/tvchart/utils/binanceHistoryDataToChartData.ts'

function TVLightWeightChart(props: {
  textColor: string
  gridColor: string
  interval: ChartInterval
}) {
  const chartStyle = useMemo(
    () => ({
      backgroundColor: 'transparent',
      lineColor: '#2962FF',
      textColor: props.textColor,
      areaTopColor: '#2962FF',
      areaBottomColor: 'rgba(41, 98, 255, 0.28)',
      gridColor: props.gridColor,
    }),
    [props.textColor, props.gridColor],
  )

  const chartContainerRef = useRef<HTMLElement | string>('')

  useEffect(() => {
    let initialData: ChartData[] = []
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

    const fetchChartData = async () => {
      await fetch(
        'https://testnet.binancefuture.com/fapi/v1/markPriceKlines?' +
          new URLSearchParams({
            symbol: 'ethusdt',
            interval: props.interval,
          }).toString(),
      )
        .then(async response => {
          return response.json()
        })
        .then(data => {
          if (data) {
            initialData = binanceHistoryDataToChartData(data as [])
          }
        })

      chart.timeScale().scrollToPosition(5, false)

      const newSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      })
      newSeries.setData(initialData as SeriesDataItemTypeMap<UTCTimestamp>['Candlestick'][])
      const exampleSocket = new WebSocket(
        'wss://fstream.binance.com/ws/ethusdt@kline_' + props.interval,
      )

      exampleSocket.onmessage = event => {
        if (typeof event.data !== 'string') {
          return
        }

        const binanceData = JSON.parse(event.data)

        if (binanceData) {
          newSeries.update(binanaceDataToChartData(binanceData as BinanceChartData, props.interval))
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
