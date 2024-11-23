import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchPositionsConstants from '@/lib/trade/services/fetchPositionsConstants'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createPositionsConstantsQueryKey(chainId: StarknetChainId) {
  return ['positionsConstants', chainId] as const
}

function createGetPositionsConstantsQueryOptions(
  chainId: StarknetChainId,
  previousChainId: StarknetChainId | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: createPositionsConstantsQueryKey(chainId),
    queryFn: async () => {
      return await fetchPositionsConstants(chainId)
    },
    placeholderData: () => {
      if (!previousChainId) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchPositionsConstants>>>(
        createPositionsConstantsQueryKey(previousChainId),
      )
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function usePositionsConstants() {
  const [chainId] = useChainId()
  const previousChainId = usePreviousDistinct(chainId)
  const queryClient = useQueryClient()
  const {data} = useQuery(
    createGetPositionsConstantsQueryOptions(chainId, previousChainId, queryClient),
  )
  return data
}
