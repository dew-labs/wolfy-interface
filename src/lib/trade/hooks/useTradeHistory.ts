import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTradeHistories, {
  type TradeDataResponse,
  type TradeHistoryAction,
} from '@/lib/trade/services/fetchTradeHistories'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export default function useTradeHistory(
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
): UseQueryResult<TradeDataResponse>
export default function useTradeHistory<T = TradeDataResponse>(
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
  selector: MemoizedCallback<(data: TradeDataResponse) => T>,
): UseQueryResult<T>
export default function useTradeHistory<T = TradeDataResponse>(
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
  selector?: MemoizedCallback<(data: TradeDataResponse) => T>,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  return useQuery({
    queryKey: ['trade-histories', chainId, accountAddress, actions, markets, isLong, page, limit],
    queryFn: async () =>
      fetchTradeHistories(chainId, accountAddress, actions, markets, isLong, page, limit),
    ...NO_REFETCH_OPTIONS,
    placeholderData: previousData => previousData,
    select: selector as (data: TradeDataResponse) => T,
    refetchInterval: 10000,
  })
}
