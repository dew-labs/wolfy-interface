import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import abs from '@/utils/numbers/bigint/abs'

export default function getCappedPositionImpactUsd(
  marketInfo: MarketData,
  sizeDeltaUsd: bigint,
  isLong: boolean,
  opts: {fallbackToZero?: boolean} = {},
) {
  const priceImpactDeltaUsd = getPriceImpactForPosition(marketInfo, sizeDeltaUsd, isLong, opts)

  if (priceImpactDeltaUsd < 0) {
    return priceImpactDeltaUsd
  }

  const {indexToken} = marketInfo

  const impactPoolAmount = marketInfo.positionImpactPoolAmount

  const maxPriceImpactUsdBasedOnImpactPool = convertTokenAmountToUsd(
    impactPoolAmount,
    indexToken.decimals,
    indexToken.price.min,
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
