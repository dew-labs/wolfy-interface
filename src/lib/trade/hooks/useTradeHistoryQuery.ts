import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTradeHistories, {
  type TradeDataResponse,
  type TradeHistoryAction,
} from '@/lib/trade/services/fetchTradeHistories'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTradeHistoryQueryKey(params: {
  chainId: StarknetChainId
  accountAddress: string | undefined
  actions: TradeHistoryAction[]
  markets: string[]
  isLong: boolean[]
  page: number
  limit: number
}) {
  return [
    'trade-histories',
    params.chainId,
    params.accountAddress,
    params.actions,
    params.markets,
    params.isLong,
    params.page,
    params.limit,
  ] as const
}

export function getTradeHistoryQueryOptions<TData = TradeDataResponse, TError = Error>(
  params: Parameters<typeof getTradeHistoryQueryKey>[0],
  options?: Omit<UseQueryOptions<TradeDataResponse, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getTradeHistoryQueryKey(params),
    queryFn: async () =>
      fetchTradeHistories(
        params.chainId,
        params.accountAddress,
        params.actions,
        params.markets,
        params.isLong,
        params.page,
        params.limit,
      ),
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    placeholderData: keepPreviousData,
    ...options,
  })
}

export default function useTradeHistoryQuery(
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(
    getTradeHistoryQueryOptions({chainId, accountAddress, actions, markets, isLong, page, limit}),
  )
}
