import type {CandlestickData, UTCTimestamp} from 'lightweight-charts'

import type {ChartInterval} from '@/lib/tvchart/datafeed/Datafeed.ts'
import {ChartIntervalTime} from '@/lib/tvchart/datafeed/Datafeed.ts'

export interface BinanceChartData {
  e: string
  E: number
  k: {
    s: string
    c: number
    o: number
    h: number
    l: number
    v: number
    q: number
  }
}

export default function binanaceDataToChartData(
  binanceData: BinanceChartData,
  interval: ChartInterval,
): CandlestickData<UTCTimestamp> {
  const coeff = 1000 * 60 * ChartIntervalTime[interval]
  const date = new Date(binanceData.E)
  const rounded = new Date(Math.floor(date.getTime() / coeff) * coeff)

  return {
    time: rounded.getTime() / 1000,
    open: Number(binanceData.k.o),
    high: Number(binanceData.k.h),
    low: Number(binanceData.k.l),
    close: Number(binanceData.k.c),
  } as CandlestickData<UTCTimestamp>
}
