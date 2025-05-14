import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import abs from '@/utils/numbers/bigint/abs'

import getPriceImpactForPosition from './getPriceImpactForPosition'

export default function getCappedPositionImpactUsd(
  marketInfo: MarketData,
  sizeDeltaUsd: bigint,
  isLong: boolean,
  tokenPricesData: TokenPricesData,
  opts: {fallbackToZero?: boolean} = {},
) {
  const priceImpactDeltaUsd = getPriceImpactForPosition(marketInfo, sizeDeltaUsd, isLong, opts)

  if (priceImpactDeltaUsd < 0) {
    return priceImpactDeltaUsd
  }

  const {indexToken} = marketInfo
  const indexTokenPrice = tokenPricesData.get(indexToken.address)

  const impactPoolAmount = marketInfo.positionImpactPoolAmount

  const maxPriceImpactUsdBasedOnImpactPool = convertTokenAmountToUsd(
    impactPoolAmount,
    indexToken.decimals,
    indexTokenPrice?.min,
  )

  let cappedImpactUsd = priceImpactDeltaUsd

  if (cappedImpactUsd > maxPriceImpactUsdBasedOnImpactPool) {
    cappedImpactUsd = maxPriceImpactUsdBasedOnImpactPool
  }

  const maxPriceImpactFactor = marketInfo.maxPositionImpactFactorPositive
  const maxPriceImpactUsdBasedOnMaxPriceImpactFactor = applyFactor(
    abs(sizeDeltaUsd),
    maxPriceImpactFactor,
  )

  if (cappedImpactUsd > maxPriceImpactUsdBasedOnMaxPriceImpactFactor) {
    cappedImpactUsd = maxPriceImpactUsdBasedOnMaxPriceImpactFactor
  }

  return cappedImpactUsd
}
