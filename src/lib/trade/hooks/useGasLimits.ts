import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasLimits from '@/lib/trade/services/fetchGasLimits'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasLimitsQueryKey(chainId: StarknetChainId) {
  return ['gasLimits', chainId] as const
}

function createGetGasLimitsQueryOptions(
  chainId: StarknetChainId,
  previousChainId: StarknetChainId | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getGasLimitsQueryKey(chainId),
    queryFn: async () => {
      return await fetchGasLimits(chainId)
    },
    placeholderData: () => {
      if (!previousChainId) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchGasLimits>>>(
        getGasLimitsQueryKey(previousChainId),
      )
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useGasLimits() {
  const [chainId] = useChainId()
  const previousChainId = usePreviousDistinct(chainId)
  const queryClient = useQueryClient()
  const {data} = useQuery(createGetGasLimitsQueryOptions(chainId, previousChainId, queryClient))
  return data
}
