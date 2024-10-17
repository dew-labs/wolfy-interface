import {queryOptions, skipToken, useQuery, useQueryClient} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData, {type MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'

import useMarkets from './useMarkets'

function createGetMarketsDataQueryOptions(chainId: StarknetChainId, markets: Market[] | undefined) {
  return queryOptions({
    queryKey: ['marketsData', chainId, markets] as const,
    queryFn: markets
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchMarketsData(chainId, markets, tokenPricesData)
        }
      : skipToken,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false,
  })
}

export default function useMarketsData() {
  const [chainId] = useChainId()
  const markets = useMarkets()

  const queryClient = useQueryClient()

  const {data: marketsData} = useQuery({
    ...createGetMarketsDataQueryOptions(chainId, markets),
    initialData: () => {
      const initialData = queryClient.getQueryData<MarketsData>([
        'marketsData',
        chainId,
        markets,
        null,
      ])
      return initialData ?? undefined
    },
  })

  return marketsData
}
