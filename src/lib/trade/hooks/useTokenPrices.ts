import type {UseQueryResult} from '@tanstack/react-query'
import {queryOptions, useQuery} from '@tanstack/react-query'
import type {MemoizedCallback} from 'react'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenPrices, {type TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenPricesQueryKey(chainId: StarknetChainId) {
  return ['tokenPrices', chainId] as const
}

function createGetTokenPricesQueryOptions<T>(
  chainId: StarknetChainId,
  selector?: MemoizedCallback<(data: TokenPricesData) => T>,
) {
  return queryOptions({
    queryKey: getTokenPricesQueryKey(chainId),
    queryFn: async () => {
      return await fetchTokenPrices(chainId)
    },
    placeholderData: previousData => previousData,
    select: selector as (data: TokenPricesData) => T,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useTokenPrices(): UseQueryResult<TokenPricesData>
export default function useTokenPrices<T = TokenPricesData>(
  selector: MemoizedCallback<(data: TokenPricesData) => T>,
): UseQueryResult<T>
export default function useTokenPrices<T = TokenPricesData>(
  selector?: MemoizedCallback<(data: TokenPricesData) => T>,
): UseQueryResult<T | undefined> {
  const [chainId] = useChainId()

  return useQuery(createGetTokenPricesQueryOptions(chainId, selector))
}
