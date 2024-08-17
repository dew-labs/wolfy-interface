import {type MarketData} from '@/lib/trade/services/fetchMarketsData'
import abs from '@/utils/numbers/bigint/abs'

import getNextOpenInterestForVirtualInventory from './getNextOpenInterestForVirtualInventory'
import getNextOpenInterestParams from './getNextOpenInterestParams'
import getPriceImpactUsd from './getPriceImpactUsd'

export default function getPriceImpactForPosition(
  marketInfo: MarketData,
  sizeDeltaUsd: bigint,
  isLong: boolean,
  opts: {fallbackToZero?: boolean} = {},
) {
  const {longInterestUsd, shortInterestUsd} = marketInfo

  const {currentLongUsd, currentShortUsd, nextLongUsd, nextShortUsd} = getNextOpenInterestParams({
    currentLongUsd: longInterestUsd,
    currentShortUsd: shortInterestUsd,
    usdDelta: sizeDeltaUsd,
    isLong: isLong,
  })

  const priceImpactUsd = getPriceImpactUsd({
    currentLongUsd,
    currentShortUsd,
    nextLongUsd,
    nextShortUsd,
    factorPositive: marketInfo.positionImpactFactorPositive,
    factorNegative: marketInfo.positionImpactFactorNegative,
    exponentFactor: marketInfo.positionImpactExponentFactor,
    fallbackToZero: !!opts.fallbackToZero,
  })

  if (priceImpactUsd > 0) {
    return priceImpactUsd
  }

  if (abs(marketInfo.virtualInventoryForPositions) <= 0) {
    return priceImpactUsd
  }

  const virtualInventoryParams = getNextOpenInterestForVirtualInventory({
    virtualInventory: marketInfo.virtualInventoryForPositions,
    usdDelta: sizeDeltaUsd,
    isLong: isLong,
  })

  const priceImpactUsdForVirtualInventory = getPriceImpactUsd({
    currentLongUsd: virtualInventoryParams.currentLongUsd,
    currentShortUsd: virtualInventoryParams.currentShortUsd,
    nextLongUsd: virtualInventoryParams.nextLongUsd,
    nextShortUsd: virtualInventoryParams.nextShortUsd,
    factorPositive: marketInfo.positionImpactFactorPositive,
    factorNegative: marketInfo.positionImpactFactorNegative,
    exponentFactor: marketInfo.positionImpactExponentFactor,
    fallbackToZero: !!opts.fallbackToZero,
  })

  return priceImpactUsdForVirtualInventory < priceImpactUsd
    ? priceImpactUsdForVirtualInventory
    : priceImpactUsd
}
