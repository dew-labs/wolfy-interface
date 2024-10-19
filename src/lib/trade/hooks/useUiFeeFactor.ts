import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchUiFeeFactor from '@/lib/trade/services/fetchUiFeeFactor'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetUiFeeFactor(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['uiFeeFactor', chainId],
    queryFn: async () => {
      return await fetchUiFeeFactor(chainId)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useUiFeeFactor() {
  const [chainId] = useChainId()
  const {data} = useQuery(createGetUiFeeFactor(chainId))
  return data
}
