import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchUiFeeFactor from '@/lib/trade/services/fetchUiFeeFactor'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getUiFeeFactorQueryKey(chainId: StarknetChainId) {
  return ['uiFeeFactor', chainId] as const
}

function createGetUiFeeFactorQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: getUiFeeFactorQueryKey(chainId),
    queryFn: async () => {
      return await fetchUiFeeFactor(chainId)
    },
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useUiFeeFactor() {
  const [chainId] = useChainId()
  return useQuery(createGetUiFeeFactorQueryOptions(chainId))
}
