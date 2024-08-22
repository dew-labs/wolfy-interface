import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions from '@/lib/trade/services/fetchPositions'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'

import useMarketsData from './useMarketsData'

function createGetPositionQueryOptions(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['positions', chainId, accountAddress, marketsData] as const,
    queryFn: marketsData
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchPositions(chainId, marketsData, tokenPricesData, accountAddress)
        }
      : skipToken,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function usePositionsData() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const {data} = useQuery(createGetPositionQueryOptions(chainId, marketsData, accountAddress))
  return data
}
