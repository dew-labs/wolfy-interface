import type {MarketData} from '@/lib/trade/services/fetchMarketData'
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
  const {
    longInterestUsd,
    shortInterestUsd,
    positionImpactFactorPositive,
    positionImpactFactorNegative,
    positionImpactExponentFactor,
    virtualInventoryForPositions,
  } = marketInfo

  const {currentLongUsd, currentShortUsd, nextLongUsd, nextShortUsd} = getNextOpenInterestParams({
    currentLongUsd: longInterestUsd,
    currentShortUsd: shortInterestUsd,
    usdDelta: sizeDeltaUsd,
    isLong,
  })

  const priceImpactUsd = getPriceImpactUsd({
    currentLongUsd,
    currentShortUsd,
    nextLongUsd,
    nextShortUsd,
    factorPositive: positionImpactFactorPositive,
    factorNegative: positionImpactFactorNegative,
    exponentFactor: positionImpactExponentFactor,
    fallbackToZero: !!opts.fallbackToZero,
  })

  if (priceImpactUsd > 0) {
    return priceImpactUsd
  }

  if (abs(virtualInventoryForPositions) <= 0) {
    return priceImpactUsd
  }

  const virtualInventoryParams = getNextOpenInterestForVirtualInventory({
    virtualInventory: virtualInventoryForPositions,
    usdDelta: sizeDeltaUsd,
    isLong,
  })

  const priceImpactUsdForVirtualInventory = getPriceImpactUsd({
    currentLongUsd: virtualInventoryParams.currentLongUsd,
    currentShortUsd: virtualInventoryParams.currentShortUsd,
    nextLongUsd: virtualInventoryParams.nextLongUsd,
    nextShortUsd: virtualInventoryParams.nextShortUsd,
    factorPositive: positionImpactFactorPositive,
    factorNegative: positionImpactFactorNegative,
    exponentFactor: positionImpactExponentFactor,
    fallbackToZero: !!opts.fallbackToZero,
  })

  return priceImpactUsdForVirtualInventory < priceImpactUsd
    ? priceImpactUsdForVirtualInventory
    : priceImpactUsd
}
