import {queryOptions, useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarkets, {type Market} from '@/lib/trade/services/fetchMarkets'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getMarketsQueryKey(chainId: StarknetChainId) {
  return ['markets', chainId] as const
}

function createGetMarketsQueryOptions<T = Market[]>(
  chainId: StarknetChainId,
  selector?: MemoizedCallback<(data: Market[]) => T>,
) {
  return queryOptions({
    queryKey: getMarketsQueryKey(chainId),
    queryFn: async () => {
      return await fetchMarkets(chainId)
    },
    placeholderData: previousData => previousData,
    select: selector as (data: Market[]) => T,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useMarkets(): UseQueryResult<Market[]>
export default function useMarkets<T = Market[]>(
  selector: MemoizedCallback<(data: Market[]) => T>,
): UseQueryResult<T>
export default function useMarkets<T = Market[]>(
  selector?: MemoizedCallback<(data: Market[]) => T>,
) {
  const [chainId] = useChainId()
  return useQuery(createGetMarketsQueryOptions(chainId, selector))
}
