import type {ChartData} from '@/lib/tvchart/datafeed/Datafeed.ts'

export default function binanceHistoryDataToChartData(binanceData: []) {
  const result: ChartData[] = []

  binanceData.forEach(candle => {
    result.push({
      time: candle[0] / 1000,
      low: Number(candle[3]),
      high: Number(candle[2]),
      open: Number(candle[1]),
      close: Number(candle[4]),
    })
  })

  return result
}
