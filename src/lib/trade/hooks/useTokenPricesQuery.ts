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
    placeholderData: keepPreviousData,
    select: selector as (data: TokenPricesData) => T,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useTokenPricesQuery(): UseQueryResult<TokenPricesData>
export default function useTokenPricesQuery<T = TokenPricesData>(
  selector: MemoizedCallback<(data: TokenPricesData) => T>,
): UseQueryResult<T>
export default function useTokenPricesQuery<T = TokenPricesData>(
  selector?: MemoizedCallback<(data: TokenPricesData) => T>,
): UseQueryResult<T | undefined> {
  const [chainId] = useChainId()

  return useQuery(createGetTokenPricesQueryOptions(chainId, selector))
}
