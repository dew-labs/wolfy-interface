import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'

import {getMaxOpenInterestUsd} from './getMaxOpenInterestUsd'
import {getMaxReservedUsd} from './getMaxReservedUsd'
import {getOpenInterestUsd} from './getOpenInterestUsd'
import {getReservedUsd} from './getReservedUsd'

export function getAvailableUsdLiquidityForPosition(
  marketInfo: MarketData,
  tokenPricesData: TokenPricesData,
  isLong: boolean,
) {
  if (marketInfo.isSpotOnly) return 0n

  const maxReservedUsd = getMaxReservedUsd(marketInfo, tokenPricesData, isLong)
  const reservedUsd = getReservedUsd(marketInfo, tokenPricesData, isLong)

  const maxOpenInterest = getMaxOpenInterestUsd(marketInfo, isLong)
  const currentOpenInterest = getOpenInterestUsd(marketInfo, isLong)

  const availableLiquidityBasedOnMaxReserve = maxReservedUsd - reservedUsd
  const availableLiquidityBasedOnMaxOpenInterest = maxOpenInterest - currentOpenInterest

  const result =
    availableLiquidityBasedOnMaxReserve < availableLiquidityBasedOnMaxOpenInterest
      ? availableLiquidityBasedOnMaxReserve
      : availableLiquidityBasedOnMaxOpenInterest

  return result < 0 ? 0n : result
}
