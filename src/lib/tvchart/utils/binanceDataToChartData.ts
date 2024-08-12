export interface BinanceChartData {
    e: string
    E: number
    k: {
        s: string
        c: number
        o: number
        h: number
        l: number
        v: number
        q: number
    }
}

export default function binanaceDataToChartData(binanceData: BinanceChartData) {
    const coeff = 1000 * 60;
    const date = new Date(binanceData.E);
    const rounded = new Date(Math.round(date.getTime() / coeff) * coeff);


    const result = {
        time: rounded.getTime(),
        open: Number(binanceData.k.o),
        high: Number(binanceData.k.h),
        low: Number(binanceData.k.l),
        close: Number(binanceData.k.c),
    };

    console.log(result)
    return result;
};
