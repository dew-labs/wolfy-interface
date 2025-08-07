import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasLimits, {type GasLimitsConfig} from '@/lib/trade/services/fetchGasLimits'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasLimitsQueryKey(params: {chainId: StarknetChainId}) {
  return ['gasLimits', params.chainId] as const
}

function getGasLimitsQueryOptions<TData = GasLimitsConfig, TError = Error>(
  params: Parameters<typeof getGasLimitsQueryKey>[0],
  options?: Omit<UseQueryOptions<GasLimitsConfig, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getGasLimitsQueryKey(params),
    queryFn: async () => {
      return await fetchGasLimits(params.chainId)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 100000,
    ...options,
  })
}

export default function useGasLimitsQuery() {
  const [chainId] = useChainId()
  return useQuery(getGasLimitsQueryOptions({chainId}))
}
