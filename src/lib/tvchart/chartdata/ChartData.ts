import type {UTCTimestamp} from 'lightweight-charts'

export enum ChartInterval {
  '1m' = '1m',
  '5m' = '5m',
  '15m' = '15m',
  '1h' = '1h',
  '4h' = '4h',
  '1d' = '1d',
  '1w' = '1w',
  '1M' = '1M',
}

export enum ChartIntervalTime {
  '1m' = 1,
  '5m' = 5,
  '15m' = 15,
  '1h' = 60,
  '4h' = 240,
  '1d' = 1440,
  '1w' = 10080,
  '1M' = 40320,
}

export interface ChartData {
  time: UTCTimestamp
  low: number
  high: number
  open: number
  close: number
  volume?: number
  volumeQuote?: number
}

export function isChartInterval(value: unknown): value is ChartInterval {
  if (typeof value !== 'string') {
    return false
  }

  return Object.values(ChartInterval).includes(value)
}

export function isIntervalSmallerThan1D(interval: ChartInterval) {
  const intervalLargerThan1D: ChartInterval[] = [
    ChartInterval['1d'],
    ChartInterval['1w'],
    ChartInterval['1M'],
  ]

  return !intervalLargerThan1D.includes(interval)
}
