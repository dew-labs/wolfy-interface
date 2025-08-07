import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchUiFeeFactor from '@/lib/trade/services/fetchUiFeeFactor'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getUiFeeFactorQueryKey(params: {chainId: StarknetChainId}) {
  return ['uiFeeFactor', params.chainId] as const
}

export function getUiFeeFactorQueryOptions<TData = bigint, TError = Error>(
  params: Parameters<typeof getUiFeeFactorQueryKey>[0],
  options?: Omit<UseQueryOptions<bigint, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getUiFeeFactorQueryKey(params),
    queryFn: async () => {
      return await fetchUiFeeFactor(params.chainId)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    ...options,
  })
}

export default function useUiFeeFactorQuery() {
  const [chainId] = useChainId()
  return useQuery(getUiFeeFactorQueryOptions({chainId}))
}
