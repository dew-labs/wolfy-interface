import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenPrices, {type TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenPricesQueryKey(chainId: StarknetChainId) {
  return ['tokenPrices', chainId] as const
}

function createGetTokenPricesQueryOptions<T>(
  chainId: StarknetChainId,
  selector: (data: TokenPricesData) => T,
) {
  return queryOptions({
    queryKey: getTokenPricesQueryKey(chainId),
    queryFn: async () => {
      return await fetchTokenPrices(chainId)
    },
    select: selector,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useTokenPrices<T>(
  selector: (tokenPrices: TokenPricesData) => T,
): T | undefined {
  const [chainId] = useChainId()
  const {data} = useQuery(createGetTokenPricesQueryOptions(chainId, selector))

  return data
}
