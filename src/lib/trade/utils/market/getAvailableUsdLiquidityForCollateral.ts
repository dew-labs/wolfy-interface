import {PRECISION} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'

import {getPoolUsdWithoutPnl} from './getPoolUsdWithoutPnl'
import {getReservedUsd} from './getReservedUsd'

export default function getAvailableUsdLiquidityForCollateral(
  marketInfo: MarketData,
  tokenPricesData: TokenPricesData,
  isLong: boolean,
) {
  const poolUsd = getPoolUsdWithoutPnl(marketInfo, tokenPricesData, isLong, 'min')

  if (marketInfo.isSpotOnly) {
    return poolUsd
  }

  const reservedUsd = getReservedUsd(marketInfo, tokenPricesData, isLong)
  const maxReserveFactor = isLong ? marketInfo.reserveFactorLong : marketInfo.reserveFactorShort

  if (maxReserveFactor === 0n) {
    return 0n
  }

  const minPoolUsd = (reservedUsd * PRECISION) / maxReserveFactor

  return poolUsd - minPoolUsd
}
