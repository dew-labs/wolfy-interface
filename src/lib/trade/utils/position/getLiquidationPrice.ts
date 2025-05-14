import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'
import expandDecimals from '@/utils/numbers/expandDecimals'

import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'

function getTotalFeesUsd(p: {
  sizeInUsd: bigint
  marketInfo: MarketData
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
  referralInfo: ReferralInfo | undefined | null
}) {
  const {sizeInUsd, marketInfo, pendingFundingFeesUsd, pendingBorrowingFeesUsd, referralInfo} = p

  const closingFeeUsd = getPositionFee(marketInfo, sizeInUsd, false, referralInfo).positionFeeUsd

  // Simply sum these two fees
  const totalPendingFeesUsd = getPositionPendingFeesUsd({
    pendingFundingFeesUsd,
    pendingBorrowingFeesUsd,
  })

  const totalFeesUsd = totalPendingFeesUsd + closingFeeUsd

  return {closingFeeUsd, totalPendingFeesUsd, totalFeesUsd}
}

function getPriceImpactDeltaUsd(p: {
  sizeInUsd: bigint
  marketInfo: MarketData
  useMaxPriceImpact?: boolean | undefined
  isLong: boolean
}) {
  const {sizeInUsd, marketInfo, useMaxPriceImpact, isLong} = p

  const maxNegativePriceImpactUsd =
    -1n * applyFactor(sizeInUsd, marketInfo.maxPositionImpactFactorForLiquidations)

  let priceImpactDeltaUsd: bigint

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

  return priceImpactDeltaUsd
}

function getLiquidationCollateralUsd(p: {
  sizeInUsd: bigint
  minCollateralFactor: bigint
  minCollateralUsd: bigint
}) {
  const {sizeInUsd, minCollateralFactor, minCollateralUsd} = p

  let liquidationCollateralUsd = applyFactor(sizeInUsd, minCollateralFactor)

  if (liquidationCollateralUsd < minCollateralUsd) {
    liquidationCollateralUsd = minCollateralUsd
  }

  return liquidationCollateralUsd
}

export default function getLiquidationPrice(p: {
  sizeInUsd: bigint
  sizeInTokens: bigint
  collateralAmount: bigint
  collateralUsd: bigint
  collateralToken: Token
  marketInfo: MarketData
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
  minCollateralUsd: bigint
  isLong: boolean
  useMaxPriceImpact?: boolean | undefined
  referralInfo: ReferralInfo | undefined | null
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
    referralInfo,
    useMaxPriceImpact,
  } = p

  if (sizeInUsd <= 0 || sizeInTokens <= 0) {
    return undefined
  }

  //--------------------------------------------------------------------------------------------------------------------

  // Depends on positionFeeFactorForPositiveImpact, positionFeeFactorForNegativeImpact of the market
  const {closingFeeUsd, totalPendingFeesUsd, totalFeesUsd} = getTotalFeesUsd({
    sizeInUsd,
    marketInfo,
    pendingFundingFeesUsd,
    pendingBorrowingFeesUsd,
    referralInfo,
  })

  //--------------------------------------------------------------------------------------------------------------------

  // Depends on
  // maxPositionImpactFactorForLiquidations
  // positionImpactFactorPositive
  // positionImpactFactorNegative
  // positionImpactExponentFactor
  // virtualInventoryForPositions
  // longInterestUsd
  // shortInterestUsd
  const priceImpactDeltaUsd = getPriceImpactDeltaUsd({
    sizeInUsd,
    marketInfo,
    useMaxPriceImpact,
    isLong,
  })

  //--------------------------------------------------------------------------------------------------------------------

  const liquidationCollateralUsd = getLiquidationCollateralUsd({
    sizeInUsd,
    minCollateralFactor: marketInfo.minCollateralFactor,
    minCollateralUsd,
  })

  //--------------------------------------------------------------------------------------------------------------------

  const {indexToken} = marketInfo

  let liquidationPrice: bigint

  if (isEquivalentTokens(collateralToken, indexToken)) {
    const denominator = (() => {
      if (isLong) return sizeInTokens + collateralAmount
      return sizeInTokens - collateralAmount
    })()

    if (denominator === 0n) {
      return undefined
    }

    const numerator = (() => {
      if (isLong) return sizeInUsd + liquidationCollateralUsd - priceImpactDeltaUsd + totalFeesUsd
      return sizeInUsd - liquidationCollateralUsd + priceImpactDeltaUsd - totalFeesUsd
    })()

    liquidationPrice = (numerator * expandDecimals(1, indexToken.decimals)) / denominator
  } else {
    if (sizeInTokens === 0n) {
      return undefined
    }

    const remainingCollateralUsd =
      collateralUsd + priceImpactDeltaUsd - totalPendingFeesUsd - closingFeeUsd

    const numerator = (() => {
      if (isLong) return liquidationCollateralUsd - remainingCollateralUsd + sizeInUsd
      return liquidationCollateralUsd - remainingCollateralUsd - sizeInUsd
    })()

    liquidationPrice = (numerator * expandDecimals(1, indexToken.decimals)) / sizeInTokens

    if (!isLong) liquidationPrice = liquidationPrice * -1n
  }

  //--------------------------------------------------------------------------------------------------------------------

  if (liquidationPrice <= 0) {
    return undefined
  }

  return liquidationPrice
}
