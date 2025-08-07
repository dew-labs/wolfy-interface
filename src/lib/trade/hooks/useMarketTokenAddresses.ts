import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'

import {getMarketsQueryOptions} from './useMarketsQuery'

const selectMarketTokenAddresses = (data: Market[]) =>
  Array.from(data.values()).map(market => market.marketTokenAddress)

export default function useMarketTokenAddresses() {
  const [chainId] = useChainId()
  return useQuery(getMarketsQueryOptions({chainId}, {select: selectMarketTokenAddresses}))
}
