import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import {fetchMarketTokensData} from '@/lib/trade/services/fetchMarketTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getMarketTokensDataQueryKey(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
) {
  return ['marketTokensData', chainId, marketTokenAddresses] as const
}

function createGetMarketTokensDataQueryOptions(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
  previousMarketTokenAddresses: string[] | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getMarketTokensDataQueryKey(chainId, marketTokenAddresses),
    queryFn: async () => {
      return await fetchMarketTokensData(chainId, marketTokenAddresses)
    },
    placeholderData: () => {
      if (!previousMarketTokenAddresses) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchMarketTokensData>>>(
        getMarketTokensDataQueryKey(chainId, previousMarketTokenAddresses),
      )
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketTokensData() {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsData()
  const marketTokenAddresses = marketsData
    ? Array.from(marketsData.values()).map(market => market.marketTokenAddress)
    : []
  const previousMarketTokenAddresses = usePreviousDistinct(marketTokenAddresses)
  const queryClient = useQueryClient()

  return useQuery(
    createGetMarketTokensDataQueryOptions(
      chainId,
      marketTokenAddresses,
      previousMarketTokenAddresses,
      queryClient,
    ),
  )
}
