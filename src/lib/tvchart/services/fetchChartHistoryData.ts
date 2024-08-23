import type {ChartData, ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import {getChartHistoryUrl} from '@/lib/tvchart/constants.ts'
import binanceHistoryDataToChartData from '@/lib/tvchart/utils/binanceHistoryDataToChartData.ts'

export default async function fetchChartHistoryData(symbol: string, interval: ChartInterval) {
  let chartHistoryData: ChartData[] = []

  await fetch(getChartHistoryUrl(symbol, interval))
    .then(async response => {
      return response.json()
    })
    .then(data => {
      if (data) {
        chartHistoryData = binanceHistoryDataToChartData(data)
      }
    })

  return chartHistoryData
}
