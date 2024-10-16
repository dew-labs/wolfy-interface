import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'
import type {UTCTimestamp} from 'lightweight-charts'

import type {ChartData, ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {ChartIntervalTime} from '@/lib/tvchart/chartdata/ChartData.ts'

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
const binanceChartDataSchema = Type.Object({
  e: Type.String(),
  E: Type.Number(),
  s: Type.String(),
  k: Type.Object({
    t: Type.Number(),
    T: Type.Number(),
    s: Type.String(),
    i: Type.String(),
    f: Type.Number(),
    L: Type.Number(),
    o: Type.String(),
    c: Type.String(),
    h: Type.String(),
    l: Type.String(),
    v: Type.String(),
    n: Type.Number(),
    x: Type.Boolean(),
    q: Type.String(),
    V: Type.String(),
    Q: Type.String(),
    B: Type.String(),
  }),
})
export type BinanceChartData = Static<typeof binanceChartDataSchema>
const binanceChartDataTypeCheck = TypeCompiler.Compile(binanceChartDataSchema)

export function binanaceDataToChartData(
  binanceData: BinanceChartData,
  interval: ChartInterval,
): ChartData {
  const coeff = 1000 * 60 * ChartIntervalTime[interval]
  const date = new Date(binanceData.E)
  const rounded = new Date(Math.floor(date.getTime() / coeff) * coeff)

  return {
    time: (rounded.getTime() / 1000) as UTCTimestamp,
    open: Number(binanceData.k.o),
    high: Number(binanceData.k.h),
    low: Number(binanceData.k.l),
    close: Number(binanceData.k.c),
    volume: Number(binanceData.k.v),
    volumeQuote: Number(binanceData.k.q),
  }
}

export function parseChartData(chartData: unknown, interval: ChartInterval): ChartData | undefined {
  if (!binanceChartDataTypeCheck.Check(chartData)) {
    return
  }

  return binanaceDataToChartData(chartData, interval)
}
