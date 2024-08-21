import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasLimits from '@/lib/trade/services/fetchGasLimits'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetGasLimitsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['gasLimits', chainId],
    queryFn: async () => {
      return await fetchGasLimits(chainId)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useGasLimits() {
  const [chainId] = useChainId()
  const {data} = useQuery(createGetGasLimitsQueryOptions(chainId))
  return data
}
