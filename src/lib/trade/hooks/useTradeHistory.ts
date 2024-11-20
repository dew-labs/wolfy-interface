import {useQuery} from '@tanstack/react-query'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTradeHistories, {
  type TradeHistoryAction,
} from '@/lib/trade/services/fetchTradeHistories'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export default function useTradeHistory(
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  const {isLoading, data} = useQuery({
    queryKey: ['trade-histories', chainId, accountAddress, actions, markets, isLong, page, limit],
    queryFn: async () =>
      fetchTradeHistories(chainId, accountAddress, actions, markets, isLong, page, limit),
    ...NO_REFETCH_OPTIONS,
    placeholderData: (previousData, _previousQuery) => {
      if (previousData) {
        return {
          ...previousData,
          isPrevious: true,
        }
      }
      return undefined
    },
    refetchInterval: 10000,
    throwOnError: false,
  })

  return {isLoading, data}
}
