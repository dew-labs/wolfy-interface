import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, skipToken, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData, {type MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarkets from './useMarkets'

export function getMarketsDataQueryKey(chainId: StarknetChainId, markets: Market[] | undefined) {
  return ['marketsData', chainId, markets] as const
}

function createGetMarketsDataQueryOptions(
  chainId: StarknetChainId,
  markets: Market[] | undefined,
  previousMarkets: Market[] | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getMarketsDataQueryKey(chainId, markets),
    queryFn: markets
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchMarketsData(chainId, markets, tokenPricesData)
        }
      : skipToken,
    placeholderData: () => {
      if (!previousMarkets) return undefined
      return queryClient.getQueryData<MarketsData>(getMarketsDataQueryKey(chainId, previousMarkets))
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketsData() {
  const [chainId] = useChainId()
  const markets = useMarkets()
  const previousMarkets = usePreviousDistinct(markets)
  const queryClient = useQueryClient()

  const {data: marketsData} = useQuery(
    createGetMarketsDataQueryOptions(chainId, markets, previousMarkets, queryClient),
  )

  return marketsData
}
