import {ColorType, createChart} from 'lightweight-charts';
import React, {useEffect, useRef} from 'react';
import binanaceDataToChartData, {
    BinanceChartData
} from "@/lib/tvchart/utils/binanceDataToChartData.ts";
import binanceHistoryDataToChartData from "@/lib/tvchart/utils/binanceHistoryDataToChartData.ts";

function TVLightWeightChart(props) {
    let initialData = [];
    const {
        colors: {
            backgroundColor = 'white',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const chartContainerRef = useRef();

    useEffect(
        () => {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                },
                width: chartContainerRef.current.clientWidth,
                height: 300,
            });
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            };

            const response = async () => {
                await fetch("https://testnet.binancefuture.com/fapi/v1/continuousKlines?" + new URLSearchParams({
                    pair: "ethusdt",
                    contractType: "PERPETUAL",
                    interval: "5m",
                    limit: 1000
                }).toString()).then(response => {
                    return response.json();
                }).then(data => {
                    if (data) {
                        initialData = binanceHistoryDataToChartData(data);
                    }
                    console.log("HAHAHA hehe", initialData)
                });

                chart.timeScale().fitContent();
                chart.timeScale().scrollToPosition(5, false);

                const newSeries = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
                    wickUpColor: '#26a69a', wickDownColor: '#ef5350'});
                newSeries.setData(initialData);
                const exampleSocket = new WebSocket(
                    "wss://fstream.binance.com/ws/ethusdt@kline_5m"
                );

                exampleSocket.onmessage = (event) => {
                    console.log();
                    const binanceData = JSON.parse(event.data);

                    if (binanceData) {
                        newSeries.update(binanaceDataToChartData(binanceData));
                    }
                };

                window.addEventListener('resize', handleResize);
            }
            response();

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [initialData, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    return (
        <div
            ref={chartContainerRef}
        />
    );
}

export default TVLightWeightChart;
