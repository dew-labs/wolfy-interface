import type {ChartInterval} from './chartdata/ChartData'

export function getChartHistoryUrl(symbol: string, interval: ChartInterval) {
  return (
    'https://testnet.binancefuture.com/fapi/v1/markPriceKlines?' +
    new URLSearchParams({symbol, interval, limit: '1500'}).toString()
  )
}

export function getChartWssUrl(symbol: string, interval: ChartInterval) {
  return `wss://fstream.binance.com/ws/${symbol}usdt@kline_${interval}`
}

export const CANDLE_STICKS_TO_RIGHT_BORDER = 5
export const CHART_STYLE = {
  BACKGROUND_COLOR: 'transparent',
  LINE_COLOR: '#2962FF',
  AREA_TOP_COLOR: '#2962FF',
  AREA_BOTTOM_COLOR: 'rgba(41, 98, 255, 0.28)',
}

export const CANDLE_STICK_SERIES = {
  UP_COLOR: '#26a69a',
  DOWN_COLOR: '#ef5350',
  BORDER_VISIBLE: false,
  WICK_UP_COLOR: '#26a69a',
  WICK_DOWN_COLOR: '#ef5350',
}
