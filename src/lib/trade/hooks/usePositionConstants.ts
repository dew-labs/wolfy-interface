import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchPositionsConstants from '@/lib/trade/services/fetchPositionsConstants'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetPositionsConstantsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['positionsConstants', chainId],
    queryFn: async () => {
      return await fetchPositionsConstants(chainId)
    },
    structuralSharing: false,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function usePositionsConstants() {
  const [chainId] = useChainId()
  const {data} = useQuery(createGetPositionsConstantsQueryOptions(chainId))
  return data
}
