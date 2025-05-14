import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchPositionsConstants from '@/lib/trade/services/fetchPositionsConstants'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createPositionsConstantsQueryKey(chainId: StarknetChainId) {
  return ['positionsConstants', chainId] as const
}

function createGetPositionsConstantsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: createPositionsConstantsQueryKey(chainId),
    queryFn: async () => {
      return await fetchPositionsConstants(chainId)
    },
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function usePositionsConstants() {
  const [chainId] = useChainId()
  return useQuery(createGetPositionsConstantsQueryOptions(chainId))
}
