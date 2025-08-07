import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarkets, {type Market} from '@/lib/trade/services/fetchMarkets'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getMarketsQueryKey(params: {chainId: StarknetChainId}) {
  return ['markets', params.chainId] as const
}

export function getMarketsQueryOptions<TData = Market[], TError = Error>(
  params: Parameters<typeof getMarketsQueryKey>[0],
  options?: Omit<UseQueryOptions<Market[], TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getMarketsQueryKey(params),
    queryFn: async () => {
      return await fetchMarkets(params.chainId)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    ...options,
  })
}

export default function useMarketsQuery() {
  const [chainId] = useChainId()
  return useQuery(getMarketsQueryOptions({chainId}))
}
