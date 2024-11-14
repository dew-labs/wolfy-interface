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
  totalPages: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  console.log(actions)
  console.log(markets)
  console.log('useTradeHistory called with:', {
    chainId,
    accountAddress,
    actions,
    markets,
    isLong,
    page,
    limit,
    totalPages,
  })

  const {data} = useQuery({
    queryKey: [
      'trade-histories',
      chainId,
      accountAddress,
      actions,
      markets,
      isLong,
      page,
      limit,
      totalPages,
    ],
    queryFn: async () =>
      fetchTradeHistories(
        chainId,
        accountAddress,
        actions,
        markets,
        isLong,
        page,
        limit,
        totalPages,
      ),
    placeholderData: {
      page: 0,
      limit: 0,
      count: 0,
      totalPages: 0,
      data: [],
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    throwOnError: false,
  })

  console.log('Trade history data:', data)

  return data ?? []
}
