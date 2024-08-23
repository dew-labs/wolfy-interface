import type {UTCTimestamp} from 'lightweight-charts'

import {logError} from '@/utils/logger'

export default function binanceHistoryDataToChartData(binanceData: unknown) {
  if (!Array.isArray(binanceData) || binanceData.length === 0) {
    console.warn('Invalid binance chart data format')
    return []
  }

  try {
    return binanceData
      .map(candle => {
        if (!candle || !Array.isArray(candle) || candle.length < 5) {
          console.warn('Candle data is not valid', candle)
          return false
        }

        return {
          time: (Number(candle[0]) / 1000) as UTCTimestamp,
          low: Number(candle[3]),
          high: Number(candle[2]),
          open: Number(candle[1]),
          close: Number(candle[4]),
        }
      })
      .filter(Boolean)
  } catch (e) {
    logError(e)
    return []
  }
}
