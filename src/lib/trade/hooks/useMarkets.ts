import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarkets from '@/lib/trade/services/fetchMarkets'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetMarketsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['markets', chainId],
    queryFn: async () => {
      return await fetchMarkets(chainId)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useMarkets() {
  const [chainId] = useChainId()

  const {data: markets} = useQuery(createGetMarketsQueryOptions(chainId))

  return markets
}
