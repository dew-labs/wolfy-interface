import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenData} from '@/lib/trade/services/fetchTokensData'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'
import expandDecimals from '@/utils/numbers/expandDecimals'

import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'

export default function getLiquidationPrice(p: {
  sizeInUsd: bigint
  sizeInTokens: bigint
  collateralAmount: bigint
  collateralUsd: bigint
  collateralToken: TokenData
  marketInfo: MarketData
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
  minCollateralUsd: bigint
  isLong: boolean
  useMaxPriceImpact?: boolean
  referralInfo: ReferralInfo | undefined
}) {
  const {
    sizeInUsd,
    sizeInTokens,
    collateralUsd,
    collateralAmount,
    marketInfo,
    collateralToken,
    pendingFundingFeesUsd,
    pendingBorrowingFeesUsd,
    minCollateralUsd,
    isLong,
    referralInfo: userReferralInfo,
    useMaxPriceImpact,
  } = p

  if (sizeInUsd <= 0 || sizeInTokens <= 0) {
    return undefined
  }

  const {indexToken} = marketInfo

  const closingFeeUsd = getPositionFee(
    marketInfo,
    sizeInUsd,
    false,
    userReferralInfo,
  ).positionFeeUsd
  const totalPendingFeesUsd = getPositionPendingFeesUsd({
    pendingFundingFeesUsd,
    pendingBorrowingFeesUsd,
  })
  const totalFeesUsd = totalPendingFeesUsd + closingFeeUsd

  const maxNegativePriceImpactUsd =
    -1n * applyFactor(sizeInUsd, marketInfo.maxPositionImpactFactorForLiquidations)

  let priceImpactDeltaUsd = 0n

  if (useMaxPriceImpact) {
    priceImpactDeltaUsd = maxNegativePriceImpactUsd
  } else {
    priceImpactDeltaUsd = getPriceImpactForPosition(marketInfo, -sizeInUsd, isLong, {
      fallbackToZero: true,
    })

    if (priceImpactDeltaUsd < maxNegativePriceImpactUsd) {
      priceImpactDeltaUsd = maxNegativePriceImpactUsd
    }

    // Ignore positive price impact
    if (priceImpactDeltaUsd > 0) {
      priceImpactDeltaUsd = 0n
    }
  }

  let liquidationCollateralUsd = applyFactor(sizeInUsd, marketInfo.minCollateralFactor)
  if (liquidationCollateralUsd < minCollateralUsd) {
    liquidationCollateralUsd = minCollateralUsd
  }

  let liquidationPrice: bigint

  if (isEquivalentTokens(collateralToken, indexToken)) {
    if (isLong) {
      const denominator = sizeInTokens + collateralAmount

      if (denominator == 0n) {
        return undefined
      }

      liquidationPrice =
        ((sizeInUsd + liquidationCollateralUsd - priceImpactDeltaUsd + totalFeesUsd) /
          denominator) *
        expandDecimals(1, indexToken.decimals)
    } else {
      const denominator = sizeInTokens - collateralAmount

      if (denominator == 0n) {
        return undefined
      }

      liquidationPrice =
        ((sizeInUsd - liquidationCollateralUsd + priceImpactDeltaUsd - totalFeesUsd) /
          denominator) *
        expandDecimals(1, indexToken.decimals)
    }
  } else {
    if (sizeInTokens == 0n) {
      return undefined
    }

    const remainingCollateralUsd =
      collateralUsd + priceImpactDeltaUsd - totalPendingFeesUsd - closingFeeUsd

    if (isLong) {
      liquidationPrice =
        ((liquidationCollateralUsd - remainingCollateralUsd + sizeInUsd) / sizeInTokens) *
        expandDecimals(1, indexToken.decimals)
    } else {
      liquidationPrice =
        ((liquidationCollateralUsd - remainingCollateralUsd - sizeInUsd) / -sizeInTokens) *
        expandDecimals(1, indexToken.decimals)
    }
  }

  if (liquidationPrice <= 0) {
    return undefined
  }

  return liquidationPrice
}
