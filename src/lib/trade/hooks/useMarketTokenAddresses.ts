import type {Market} from '@/lib/trade/services/fetchMarkets'
import markAsMemoized from '@/utils/react/markAsMemoized'

import useMarkets from './useMarkets'

const selectMarketTokenAddresses = markAsMemoized((data: Market[]) =>
  data
    .values()
    .map(market => market.marketTokenAddress)
    .toArray(),
)

export default function useMarketTokenAddresses() {
  return useMarkets(selectMarketTokenAddresses)
}
