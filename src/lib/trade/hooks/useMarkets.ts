import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarkets from '@/lib/trade/services/fetchMarkets'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getMarketsQueryKey(chainId: StarknetChainId) {
  return ['markets', chainId] as const
}

function createGetMarketsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: getMarketsQueryKey(chainId),
    queryFn: async () => {
      return await fetchMarkets(chainId)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useMarkets() {
  const [chainId] = useChainId()
  return useQuery(createGetMarketsQueryOptions(chainId))
}
