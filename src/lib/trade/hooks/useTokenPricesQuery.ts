import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenPrices, {type TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenPricesQueryKey(params: {chainId: StarknetChainId}) {
  return ['tokenPrices', params.chainId] as const
}

export function getTokenPricesQueryOptions<TData = TokenPricesData, TError = Error>(
  params: Parameters<typeof getTokenPricesQueryKey>[0],
  options?: Omit<UseQueryOptions<TokenPricesData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getTokenPricesQueryKey(params),
    queryFn: async () => {
      return await fetchTokenPrices(params.chainId)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    ...options,
  })
}

export default function useTokenPricesQuery() {
  const [chainId] = useChainId()

  return useQuery(getTokenPricesQueryOptions({chainId}))
}
