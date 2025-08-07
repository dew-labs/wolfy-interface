import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData, {type MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsQuery from './useMarketsQuery'

export function getMarketsDataQueryKey(params: {
  chainId: StarknetChainId
  markets: Market[] | undefined
}) {
  return ['marketsData', params.chainId, params.markets] as const
}

export function getMarketsDataQueryOptions<TData = MarketsData, TError = Error>(
  params: Parameters<typeof getMarketsDataQueryKey>[0],
  options?: Omit<UseQueryOptions<MarketsData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getMarketsDataQueryKey(params),
    queryFn: params.markets
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(params.chainId)
          invariant(params.markets)
          return await fetchMarketsData(params.chainId, params.markets, tokenPricesData)
        }
      : skipToken,
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export default function useMarketsDataQuery() {
  const [chainId] = useChainId()
  const {data: markets} = useMarketsQuery()

  return useQuery(getMarketsDataQueryOptions({chainId, markets}))
}
