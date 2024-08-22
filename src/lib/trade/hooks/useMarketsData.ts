import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData from '@/lib/trade/services/fetchMarketsData'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'

import useMarkets from './useMarkets'

function createGetMarketsDataQueryOptions(
  chainId: StarknetChainId,
  markets: Market[] | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['marketsData', chainId, accountAddress, markets] as const,
    queryFn: markets
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchMarketsData(chainId, markets, tokenPricesData, accountAddress)
        }
      : skipToken,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketsData() {
  const [chainId] = useChainId()
  const markets = useMarkets()
  const accountAddress = useAccountAddress()

  const {data: marketsData} = useQuery(
    createGetMarketsDataQueryOptions(chainId, markets, accountAddress),
  )

  return marketsData
}
