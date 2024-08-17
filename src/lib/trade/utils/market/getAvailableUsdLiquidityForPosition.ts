import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import {getMaxOpenInterestUsd} from './getMaxOpenInterestUsd'
import {getMaxReservedUsd} from './getMaxReservedUsd'
import {getOpenInterestUsd} from './getOpenInterestUsd'
import {getReservedUsd} from './getReservedUsd'

export function getAvailableUsdLiquidityForPosition(marketInfo: MarketData, isLong: boolean) {
  if (marketInfo.isSpotOnly) return 0n

  const maxReservedUsd = getMaxReservedUsd(marketInfo, isLong)
  const reservedUsd = getReservedUsd(marketInfo, isLong)

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
