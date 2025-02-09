import {type} from 'arktype'
import type {UTCTimestamp} from 'lightweight-charts'

import type {ChartData, ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {ChartIntervalTime} from '@/lib/tvchart/chartdata/ChartData.ts'
import {correctTimezone} from '@/lib/tvchart/constants'

// {
//   "e": "kline",     // Event type
//   "E": 1638747660000,   // Event time
//   "s": "BTCUSDT",    // Symbol
//   "k": {
//     "t": 1638747660000, // Kline start time
//     "T": 1638747719999, // Kline close time
//     "s": "BTCUSDT",  // Symbol
//     "i": "1m",      // Interval
//     "f": 100,       // First trade ID
//     "L": 200,       // Last trade ID
//     "o": "0.0010",  // Open price
//     "c": "0.0020",  // Close price
//     "h": "0.0025",  // High price
//     "l": "0.0015",  // Low price
//     "v": "1000",    // Base asset volume
//     "n": 100,       // Number of trades
//     "x": false,     // Is this kline closed?
//     "q": "1.0000",  // Quote asset volume
//     "V": "500",     // Taker buy base asset volume
//     "Q": "0.500",   // Taker buy quote asset volume
//     "B": "123456"   // Ignore
//   }
// }
const binanceChartData = type({
  e: 'string',
  E: 'number',
  s: 'string',
  k: type({
    t: 'number',
    T: 'number',
    s: 'string',
    i: 'string',
    f: 'number',
    L: 'number',
    o: 'string',
    c: 'string',
    h: 'string',
    l: 'string',
    v: 'string',
    n: 'number',
    x: 'boolean',
    q: 'string',
    V: 'string',
    Q: 'string',
    B: 'string',
  }),
})
export type BinanceChartData = typeof binanceChartData.infer

export function binanceDataToChartData(
  binanceData: BinanceChartData,
  interval: ChartInterval,
): ChartData {
  const coeff = 1000 * 60 * ChartIntervalTime[interval]
  const date = new Date(binanceData.E)
  const rounded = new Date(Math.floor(date.getTime() / coeff) * coeff)

  return {
    time: correctTimezone(rounded.getTime() / 1000) as UTCTimestamp,
    open: Number(binanceData.k.o),
    high: Number(binanceData.k.h),
    low: Number(binanceData.k.l),
    close: Number(binanceData.k.c),
    volume: Number(binanceData.k.v),
    volumeQuote: Number(binanceData.k.q),
  }
}

export function parseChartData(chartData: unknown, interval: ChartInterval): ChartData | undefined {
  const data = binanceChartData(chartData)
  if (data instanceof type.errors) {
    return
  }

  return binanceDataToChartData(data, interval)
}
