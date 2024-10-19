import {queryOptions, useQuery} from '@tanstack/react-query'
import {StarknetChainId} from 'satoru-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import {fetchMarketTokensData} from '@/lib/trade/services/fetchMarketTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetMarketTokensDataQueryOptions(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
) {
  return queryOptions({
    queryKey: ['marketTokensData', chainId, marketTokenAddresses] as const,
    queryFn: async () => {
      return await fetchMarketTokensData(chainId, marketTokenAddresses)
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketTokensData() {
  const [chainId] = useChainId()
  const marketsData = useMarketsData()

  const marketTokenAddresses = marketsData
    ? Array.from(marketsData.values()).map(market => market.marketTokenAddress)
    : []

  const {data} = useQuery(createGetMarketTokensDataQueryOptions(chainId, marketTokenAddresses))
  return data
}
