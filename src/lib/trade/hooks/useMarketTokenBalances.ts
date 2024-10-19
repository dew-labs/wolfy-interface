import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarketTokenBalances from '@/lib/trade/services/fetchMarketTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'

function createGetMarketTokenBalancesQueryOptions(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
  accountAddress: string,
) {
  return queryOptions({
    queryKey: ['marketTokenBalances', chainId, marketTokenAddresses, accountAddress] as const,
    queryFn: async () => {
      return await fetchMarketTokenBalances(chainId, marketTokenAddresses, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketTokenBalances() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const marketTokenAddresses = marketsData ? Array.from(marketsData.keys()) : []
  const {data} = useQuery(
    createGetMarketTokenBalancesQueryOptions(chainId, marketTokenAddresses, accountAddress),
  )
  return data
}
