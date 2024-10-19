import {useQuery} from '@tanstack/react-query'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTradeHistories, {
  type TradeHistoryAction,
} from '@/lib/trade/services/fetchTradeHistories'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export default function useTradeHistory(actions: TradeHistoryAction[], markets: string[]) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  console.log(actions)
  console.log(markets)

  const {data} = useQuery({
    queryKey: ['trade-histories', chainId, accountAddress, actions, markets],
    queryFn: async () => fetchTradeHistories(chainId, accountAddress, actions, markets),
    placeholderData: [],
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    throwOnError: false,
  })

  return data
}
