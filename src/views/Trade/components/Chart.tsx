import TVLightWeightChart from "@/views/Trade/components/TVChart/TVLightWeightChart.tsx";
import {useCurrentTheme} from "@/lib/theme/useCurrentTheme.ts";

export default function Chart() {
    const [currentTheme] = useCurrentTheme();

    // const exampleSocket = new WebSocket(
    //     "wss://fstream.binance.com/ws/ethusdt@kline_5m"
    // );
    //
    // exampleSocket.onmessage = (event) => {
    //     console.log(event.data);
    // };

    return (
        <div className='w-full flex-1'>
          <TVLightWeightChart

          ></TVLightWeightChart>
        </div>
    )

}
