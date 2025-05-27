import type {Market} from '@/lib/trade/services/fetchMarkets'
import markAsMemoized from '@/utils/react/markAsMemoized'

import useMarketsQuery from './useMarketsQuery'

const selectMarketTokenAddresses = markAsMemoized((data: Market[]) =>
  Array.from(data.values()).map(market => market.marketTokenAddress),
)

export default function useMarketTokenAddresses() {
  return useMarketsQuery(selectMarketTokenAddresses)
}
