export default function binanceHistoryDataToChartData(binanceData: []) {
  return binanceData.map(candle => ({
    time: candle[0] / 1000,
    low: Number(candle[3]),
    high: Number(candle[2]),
    open: Number(candle[1]),
    close: Number(candle[4]),
  }))
}
