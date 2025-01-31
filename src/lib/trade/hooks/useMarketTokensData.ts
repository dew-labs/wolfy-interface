import type {UseQueryResult} from '@tanstack/react-query'
import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import {
  fetchMarketTokensData,
  type MarketTokensData,
} from '@/lib/trade/services/fetchMarketTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketTokenAddresses from './useMarketTokenAddresses'

export function getMarketTokensDataQueryKey(
  chainId: StarknetChainId,
  marketTokenAddresses: string[] | undefined,
) {
  return ['marketTokensData', chainId, marketTokenAddresses] as const
}

function createGetMarketTokensDataQueryOptions<T = MarketTokensData>(
  chainId: StarknetChainId,
  marketTokenAddresses: string[] | undefined,
  selector?: MemoizedCallback<(data: MarketTokensData) => T>,
) {
  return queryOptions({
    queryKey: getMarketTokensDataQueryKey(chainId, marketTokenAddresses),
    queryFn: async () => {
      return await fetchMarketTokensData(chainId, marketTokenAddresses ?? [])
    },
    select: selector as (data: MarketTokensData) => T,
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketTokensData(): UseQueryResult<MarketTokensData>
export default function useMarketTokensData<T = MarketTokensData>(
  selector: MemoizedCallback<(data: MarketTokensData) => T>,
): UseQueryResult<T>
export default function useMarketTokensData<T = MarketTokensData>(
  selector?: MemoizedCallback<(data: MarketTokensData) => T>,
): UseQueryResult<T> {
  const [chainId] = useChainId()
  const {data: marketTokenAddresses} = useMarketTokenAddresses()

  return useQuery(createGetMarketTokensDataQueryOptions(chainId, marketTokenAddresses, selector))
}
