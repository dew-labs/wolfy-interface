import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchUiFeeFactor from '@/lib/trade/services/fetchUiFeeFactor'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getUiFeeFactorQueryKey(chainId: StarknetChainId) {
  return ['uiFeeFactor', chainId] as const
}

function createGetUiFeeFactorQueryOptions(
  chainId: StarknetChainId,
  previousChainId: StarknetChainId | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getUiFeeFactorQueryKey(chainId),
    queryFn: async () => {
      return await fetchUiFeeFactor(chainId)
    },
    placeholderData: () => {
      if (!previousChainId) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchUiFeeFactor>>>(
        getUiFeeFactorQueryKey(previousChainId),
      )
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useUiFeeFactor() {
  const [chainId] = useChainId()
  const previousChainId = usePreviousDistinct(chainId)
  const queryClient = useQueryClient()
  const {data} = useQuery(createGetUiFeeFactorQueryOptions(chainId, previousChainId, queryClient))
  return data
}
