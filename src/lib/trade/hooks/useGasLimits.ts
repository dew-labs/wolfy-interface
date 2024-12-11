import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasLimits from '@/lib/trade/services/fetchGasLimits'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasLimitsQueryKey(chainId: StarknetChainId) {
  return ['gasLimits', chainId] as const
}

function createGetGasLimitsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: getGasLimitsQueryKey(chainId),
    queryFn: async () => {
      return await fetchGasLimits(chainId)
    },
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 100000,
  })
}

export default function useGasLimits() {
  const [chainId] = useChainId()
  return useQuery(createGetGasLimitsQueryOptions(chainId))
}
