import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchPositionsConstants, {
  type PositionConstants,
} from '@/lib/trade/services/fetchPositionsConstants'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getPositionsConstantsQueryKey(params: {chainId: StarknetChainId}) {
  return ['positionsConstants', params.chainId] as const
}

export function getPositionsConstantsQueryOptions<TData = PositionConstants, TError = Error>(
  params: Parameters<typeof getPositionsConstantsQueryKey>[0],
  options?: Omit<UseQueryOptions<PositionConstants, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getPositionsConstantsQueryKey(params),
    queryFn: async () => {
      return await fetchPositionsConstants(params.chainId)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    ...options,
  })
}

export default function usePositionsConstantsQuery() {
  const [chainId] = useChainId()
  return useQuery(getPositionsConstantsQueryOptions({chainId}))
}
