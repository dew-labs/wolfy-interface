import {MOCK_SYMBOL_MAP} from '@/constants/tokens'
import {ChartInterval} from '@/lib/tvchart/chartdata/ChartData'
import {getChartWssUrl} from '@/lib/tvchart/constants'
import {parseChartData} from '@/lib/tvchart/utils/binanceDataToChartData'

interface OHLCV {
  open: number
  close: number
  high: number
  low: number
  volume: number
}

interface OHLCVEffectsProps {
  symbol: string | undefined
}

export const OHLCVEffects = memo(function OHLCVEffects({symbol}: OHLCVEffectsProps) {
  const queryClient = useQueryClient()

  useEffect(
    function subscribeToChartData() {
      if (!symbol) return

      const asset = MOCK_SYMBOL_MAP[symbol]

      if (!asset) return

      const wssUrl = getChartWssUrl(asset, ChartInterval['1d'])
      const chartDataWS = new WebSocket(wssUrl)

      const abortController = new AbortController()

      chartDataWS.addEventListener(
        'message',
        event => {
          if (typeof event.data !== 'string') {
            return
          }

          const rawData = JSON.parse(event.data)
          const data = parseChartData(rawData, ChartInterval['1d'])

          if (!data) return

          queryClient.setQueryData(['ohlcv', symbol], {
            open: data.open,
            close: data.close,
            high: data.high,
            low: data.low,
            volume: data.volume ?? 0,
          })
        },
        {signal: abortController.signal},
      )

      return () => {
        abortController.abort()
        chartDataWS.close()
      }
    },
    [symbol, queryClient],
  )

  return null
})

export default function useOHLCVQuery(symbol: string | undefined) {
  return useQuery({
    queryKey: ['ohlcv', symbol],
    queryFn: skipToken,
    enabled: false,
  }) as UseQueryResult<OHLCV>
}
