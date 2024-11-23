import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenPrices, {type TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenPricesQueryKey(chainId: StarknetChainId) {
  return ['tokenPrices', chainId] as const
}

function createGetTokenPricesQueryOptions<T>(
  chainId: StarknetChainId,
  previousChainId: StarknetChainId | undefined,
  selector: (data: TokenPricesData) => T,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getTokenPricesQueryKey(chainId),
    queryFn: async () => {
      return await fetchTokenPrices(chainId)
    },
    placeholderData: () => {
      if (!previousChainId) return undefined
      return queryClient.getQueryData<TokenPricesData>(getTokenPricesQueryKey(previousChainId))
    },
    select: selector,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useTokenPrices<T>(
  selector: (tokenPrices: TokenPricesData) => T,
): T | undefined {
  const [chainId] = useChainId()
  const previousChainId = usePreviousDistinct(chainId)
  const queryClient = useQueryClient()

  const {data} = useQuery(
    createGetTokenPricesQueryOptions(chainId, previousChainId, selector, queryClient),
  )

  return data
}
