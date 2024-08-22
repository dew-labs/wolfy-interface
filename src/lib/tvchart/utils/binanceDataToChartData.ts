import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'

import type {ChartData, ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {ChartIntervalTime} from '@/lib/tvchart/chartdata/ChartData.ts'

const binanceChartDataSchema = Type.Object({
  e: Type.String(),
  E: Type.Number(),
  k: Type.Object({
    s: Type.String(),
    c: Type.String(),
    o: Type.String(),
    h: Type.String(),
    l: Type.String(),
    v: Type.String(),
    q: Type.String(),
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
    time: rounded.getTime() / 1000,
    open: Number(binanceData.k.o),
    high: Number(binanceData.k.h),
    low: Number(binanceData.k.l),
    close: Number(binanceData.k.c),
  }
}

export function parseChartData(chartData: unknown, interval: ChartInterval): ChartData | undefined {
  if (!binanceChartDataTypeCheck.Check(chartData)) {
    return
  }

  return binanaceDataToChartData(chartData, interval)
}
