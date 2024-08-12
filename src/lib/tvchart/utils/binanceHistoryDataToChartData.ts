export default function binanceHistoryDataToChartData(binanceData: []) {
    const result = [];

    binanceData.forEach(candle => {
        result.push({
            time: candle[0] / 1000,
            low: Number(candle[3]),
            high: Number(candle[2]),
            open: Number(candle[1]),
            close: Number(candle[4]),
        })
    })

    console.log("HAHAHA binan", binanceData);
    console.log("HAHAHA result", result);

    return result;
}
