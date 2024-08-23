import type {ChartData} from '@/lib/tvchart/chartdata/ChartData.ts'
import {CHART_HISTORY_DATA_URL} from '@/lib/tvchart/constants.ts'
import binanceHistoryDataToChartData from '@/lib/tvchart/utils/binanceHistoryDataToChartData.ts'

export default async function fetchChartHistoryData(symbol: string, interval: string) {
  let chartHistoryData: ChartData[] = []

  await fetch(CHART_HISTORY_DATA_URL + new URLSearchParams({symbol, interval}).toString())
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
