import {DecreasePositionSwapType, OrderType} from 'wolfy-sdk'

import {DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER} from '@/constants/config'
import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import {BASIS_POINTS_DIVISOR_BIGINT, DUST_USD, MAX_UINT256} from '@/lib/trade/numbers/constants'
import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'
import roundUpDivision from '@/lib/trade/numbers/roundUpDivision'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {Price, TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getTriggerThresholdType, {
  type TriggerThresholdType,
} from '@/lib/trade/utils/order/getTriggerThresholdType'
import getSwapStats from '@/lib/trade/utils/order/swap/getSwapStats'
import getLeverage from '@/lib/trade/utils/position/getLeverage'
import getPositionPnlUsd from '@/lib/trade/utils/position/getPositionPnlUsd'
import type {PositionInfo} from '@/lib/trade/utils/position/getPositionsInfo'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import getAcceptablePriceInfo from '@/lib/trade/utils/price/getAcceptablePriceInfo'
import getDefaultAcceptablePriceImpactBps from '@/lib/trade/utils/price/getDefaultAcceptablePriceImpactBps'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'
import abs from '@/utils/numbers/bigint/abs'

import getTriggerDecreaseOrderType from './getTriggerDecreaseOrderType'

export interface DecreasePositionAmounts {
  isFullClose: boolean
  sizeDeltaUsd: bigint
  sizeDeltaInTokens: bigint
  collateralDeltaUsd: bigint
  collateralDeltaAmount: bigint

  indexPrice: bigint
  collateralPrice: bigint
  triggerPrice?: bigint
  acceptablePrice: bigint
  acceptablePriceDeltaBps: bigint
  recommendedAcceptablePriceDeltaBps: bigint

  estimatedPnl: bigint
  estimatedPnlPercentage: bigint
  realizedPnl: bigint
  realizedPnlPercentage: bigint

  positionFeeUsd: bigint
  uiFeeUsd: bigint
  swapUiFeeUsd: bigint
  feeDiscountUsd: bigint
  borrowingFeeUsd: bigint
  fundingFeeUsd: bigint
  swapProfitFeeUsd: bigint
  positionPriceImpactDeltaUsd: bigint
  priceImpactDiffUsd: bigint
  payedRemainingCollateralAmount: bigint

  payedOutputUsd: bigint
  payedRemainingCollateralUsd: bigint

  receiveTokenAmount: bigint
  receiveUsd: bigint

  triggerOrderType?: OrderType.LimitDecrease | OrderType.StopLossDecrease | undefined
  triggerThresholdType?: TriggerThresholdType | undefined
  decreaseSwapType: DecreasePositionSwapType
}

export default function getDecreasePositionAmounts(p: {
  marketInfo: MarketData
  collateralToken: Token
  isLong: boolean
  position: PositionInfo | undefined
  closeSizeUsd: bigint
  keepLeverage: boolean
  triggerPrice?: bigint | undefined
  fixedAcceptablePriceImpactBps?: bigint | undefined
  acceptablePriceImpactBuffer?: number | undefined
  userReferralInfo: ReferralInfo | undefined
  minCollateralUsd: bigint
  minPositionSizeUsd: bigint
  uiFeeFactor: bigint
  isLimit?: boolean | undefined
  limitPrice?: bigint | undefined
  triggerOrderType?: DecreasePositionAmounts['triggerOrderType']
  receiveToken?: Token | undefined
  tokenPricesData: TokenPricesData
}) {
  const {
    marketInfo,
    collateralToken,
    isLong,
    position,
    closeSizeUsd,
    keepLeverage,
    triggerPrice,
    fixedAcceptablePriceImpactBps,
    acceptablePriceImpactBuffer,
    userReferralInfo,
    minCollateralUsd,
    minPositionSizeUsd,
    uiFeeFactor,
    isLimit,
    limitPrice,
    triggerOrderType: orderType,
    receiveToken: receiveTokenArg,
    tokenPricesData,
  } = p

  const {indexToken} = marketInfo
  const receiveToken = receiveTokenArg ?? collateralToken

  const values: DecreasePositionAmounts = {
    isFullClose: false,
    sizeDeltaUsd: 0n,
    sizeDeltaInTokens: 0n,
    collateralDeltaUsd: 0n,
    collateralDeltaAmount: 0n,

    indexPrice: 0n,
    collateralPrice: 0n,
    triggerPrice: 0n,
    acceptablePrice: 0n,

    positionPriceImpactDeltaUsd: 0n,
    priceImpactDiffUsd: 0n,
    acceptablePriceDeltaBps: 0n,
    recommendedAcceptablePriceDeltaBps: 0n,

    estimatedPnl: 0n,
    estimatedPnlPercentage: 0n,
    realizedPnl: 0n,
    realizedPnlPercentage: 0n,

    positionFeeUsd: 0n,
    uiFeeUsd: 0n,
    swapUiFeeUsd: 0n,
    borrowingFeeUsd: 0n,
    fundingFeeUsd: 0n,
    feeDiscountUsd: 0n,
    swapProfitFeeUsd: 0n,
    payedOutputUsd: 0n,
    payedRemainingCollateralUsd: 0n,
    payedRemainingCollateralAmount: 0n,

    receiveTokenAmount: 0n,
    receiveUsd: 0n,

    triggerOrderType: orderType,
    triggerThresholdType: undefined,
    decreaseSwapType: DecreasePositionSwapType.NoSwap,
  }

  const indexTokenPrice = tokenPricesData.get(indexToken.address)
  const collateralTokenPrice = tokenPricesData.get(collateralToken.address)

  if (!indexTokenPrice || !collateralTokenPrice) {
    return values
  }

  const pnlToken = isLong ? marketInfo.longToken : marketInfo.shortToken

  values.decreaseSwapType = getDecreaseSwapType(pnlToken, collateralToken, receiveToken)

  const markPrice = getMarkPrice({price: indexTokenPrice, isIncrease: false, isLong})
  const isTrigger = Boolean(triggerPrice !== undefined && triggerPrice > 0)

  if (triggerPrice !== undefined && triggerPrice > 0) {
    values.triggerPrice = triggerPrice
    values.indexPrice = triggerPrice

    values.collateralPrice = isEquivalentTokens(indexToken, collateralToken)
      ? triggerPrice
      : collateralTokenPrice.min

    values.triggerOrderType ??= getTriggerDecreaseOrderType({
      markPrice: isLimit ? (limitPrice ?? 0n) : markPrice,
      triggerPrice,
      isLong,
    })

    values.triggerThresholdType = getTriggerThresholdType(values.triggerOrderType, isLong)
  } else {
    values.indexPrice = markPrice
    values.collateralPrice = collateralTokenPrice.min
  }

  if (closeSizeUsd <= 0) {
    return values
  }

  values.sizeDeltaUsd = closeSizeUsd

  if (!position || position.sizeInUsd <= 0 || position.sizeInTokens <= 0) {
    applyAcceptablePrice({
      marketInfo,
      isLong,
      isTrigger,
      fixedAcceptablePriceImpactBps,
      acceptablePriceImpactBuffer,
      values,
      tokenPricesData,
    })

    const positionFeeInfo = getPositionFee(
      marketInfo,
      values.sizeDeltaUsd,
      values.positionPriceImpactDeltaUsd > 0,
      userReferralInfo,
    )

    values.positionFeeUsd = positionFeeInfo.positionFeeUsd
    values.feeDiscountUsd = positionFeeInfo.discountUsd
    values.uiFeeUsd = applyFactor(values.sizeDeltaUsd, uiFeeFactor)

    const totalFeesUsd =
      0n +
      values.positionFeeUsd +
      values.uiFeeUsd +
      (values.positionPriceImpactDeltaUsd < 0 ? values.positionPriceImpactDeltaUsd : 0n)

    values.payedOutputUsd = totalFeesUsd

    return values
  }

  const estimatedCollateralUsd = convertTokenAmountToUsd(
    position.collateralAmount,
    collateralToken.decimals,
    values.collateralPrice,
  )

  let estimatedCollateralDeltaUsd = 0n

  if (keepLeverage) {
    estimatedCollateralDeltaUsd =
      (values.sizeDeltaUsd * estimatedCollateralUsd) / position.sizeInUsd
  }

  values.isFullClose = isFullClose({
    position,
    sizeDeltaUsd: values.sizeDeltaUsd,
    indexPrice: values.indexPrice,
    remainingCollateralUsd: estimatedCollateralUsd - estimatedCollateralDeltaUsd,
    minCollateralUsd,
    minPositionSizeUsd,
    tokenPricesData,
  })

  if (values.isFullClose) {
    values.sizeDeltaUsd = position.sizeInUsd
    values.sizeDeltaInTokens = position.sizeInTokens
  } else if (position.isLong) {
    values.sizeDeltaInTokens = roundUpDivision(
      position.sizeInTokens * values.sizeDeltaUsd,
      position.sizeInUsd,
    )
  } else {
    values.sizeDeltaInTokens = (position.sizeInTokens * values.sizeDeltaUsd) / position.sizeInUsd
  }

  // PNL
  values.estimatedPnl = getPositionPnlUsd({
    marketInfo,
    sizeInUsd: position.sizeInUsd,
    sizeInTokens: position.sizeInTokens,
    markPrice: values.indexPrice,
    isLong,
    tokenPricesData,
  })

  values.realizedPnl = (values.estimatedPnl * values.sizeDeltaInTokens) / position.sizeInTokens
  values.realizedPnlPercentage =
    estimatedCollateralUsd === 0n ? 0n : getBasisPoints(values.realizedPnl, estimatedCollateralUsd)
  values.estimatedPnlPercentage =
    estimatedCollateralUsd === 0n ? 0n : getBasisPoints(values.estimatedPnl, estimatedCollateralUsd)

  applyAcceptablePrice({
    marketInfo,
    isLong,
    isTrigger,
    fixedAcceptablePriceImpactBps,
    acceptablePriceImpactBuffer,
    values,
    tokenPricesData,
  })

  // Profit
  let profitUsd = 0n
  if (values.realizedPnl > 0) {
    profitUsd = profitUsd + values.realizedPnl
  }
  if (values.positionPriceImpactDeltaUsd > 0) {
    profitUsd = profitUsd + values.positionPriceImpactDeltaUsd
  }
  const profitAmount = convertUsdToTokenAmount(
    profitUsd,
    collateralToken.decimals,
    values.collateralPrice,
  )

  // Fees
  const positionFeeInfo = getPositionFee(
    marketInfo,
    values.sizeDeltaUsd,
    values.positionPriceImpactDeltaUsd > 0,
    userReferralInfo,
  )
  const estimatedPositionFeeCost = estimateCollateralCost(
    positionFeeInfo.positionFeeUsd,
    collateralToken,
    values.collateralPrice,
    collateralTokenPrice,
  )
  const estimatedDiscountCost = estimateCollateralCost(
    positionFeeInfo.discountUsd,
    collateralToken,
    values.collateralPrice,
    collateralTokenPrice,
  )

  values.positionFeeUsd = estimatedPositionFeeCost.usd
  values.feeDiscountUsd = estimatedDiscountCost.usd
  values.uiFeeUsd = applyFactor(values.sizeDeltaUsd, uiFeeFactor)

  const borrowFeeCost = estimateCollateralCost(
    position.pendingBorrowingFeesUsd,
    collateralToken,
    values.collateralPrice,
    collateralTokenPrice,
  )

  values.borrowingFeeUsd = borrowFeeCost.usd

  const fundingFeeCost = estimateCollateralCost(
    position.pendingFundingFeesUsd,
    collateralToken,
    values.collateralPrice,
    collateralTokenPrice,
  )

  values.fundingFeeUsd = fundingFeeCost.usd

  if (
    profitUsd > 0 &&
    values.decreaseSwapType === DecreasePositionSwapType.SwapPnlTokenToCollateralToken
  ) {
    const swapProfitStats = getSwapStats({
      marketInfo,
      tokenInAddress: pnlToken.address,
      tokenOutAddress: collateralToken.address,
      usdIn: profitUsd,
      shouldApplyPriceImpact: true,
      tokenPricesData,
    })

    values.swapProfitFeeUsd = swapProfitStats.swapFeeUsd - swapProfitStats.priceImpactDeltaUsd
    values.swapUiFeeUsd = applyFactor(swapProfitStats.usdIn, uiFeeFactor)
  } else {
    values.swapProfitFeeUsd = 0n
  }

  const negativePnlUsd = values.realizedPnl < 0 ? abs(values.realizedPnl) : 0n
  const negativePriceImpactUsd =
    values.positionPriceImpactDeltaUsd < 0 ? abs(values.positionPriceImpactDeltaUsd) : 0n
  const priceImpactDiffUsd = values.priceImpactDiffUsd > 0 ? values.priceImpactDiffUsd : 0n

  const totalFeesUsd =
    values.positionFeeUsd +
    values.borrowingFeeUsd +
    values.fundingFeeUsd +
    values.swapProfitFeeUsd +
    values.swapUiFeeUsd +
    values.uiFeeUsd +
    negativePnlUsd +
    negativePriceImpactUsd +
    priceImpactDiffUsd

  const payedInfo = payForCollateralCost({
    initialCostUsd: totalFeesUsd,
    collateralToken,
    collateralPrice: values.collateralPrice,
    outputAmount: profitAmount,
    remainingCollateralAmount: position.collateralAmount,
  })

  values.payedOutputUsd = convertTokenAmountToUsd(
    payedInfo.paidOutputAmount,
    collateralToken.decimals,
    values.collateralPrice,
  )
  values.payedRemainingCollateralAmount = payedInfo.paidRemainingCollateralAmount
  values.payedRemainingCollateralUsd = convertTokenAmountToUsd(
    payedInfo.paidRemainingCollateralAmount,
    collateralToken.decimals,
    values.collateralPrice,
  )

  values.receiveTokenAmount = payedInfo.outputAmount

  // Collateral delta
  if (values.isFullClose) {
    values.collateralDeltaUsd = estimatedCollateralUsd
    values.collateralDeltaAmount = position.collateralAmount
    values.receiveTokenAmount = payedInfo.outputAmount + payedInfo.remainingCollateralAmount
  } else if (
    keepLeverage &&
    position.sizeInUsd > 0 &&
    estimatedCollateralUsd > 0 &&
    payedInfo.remainingCollateralAmount > 0
  ) {
    const remainingCollateralUsd = convertTokenAmountToUsd(
      payedInfo.remainingCollateralAmount,
      collateralToken.decimals,
      values.collateralPrice,
    )
    const nextSizeInUsd = position.sizeInUsd - values.sizeDeltaUsd
    const leverageWithoutPnl = getLeverage({
      sizeInUsd: position.sizeInUsd,
      collateralUsd: estimatedCollateralUsd,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd: position.pendingFundingFeesUsd,
      pnl: undefined,
    })

    values.collateralDeltaUsd =
      /**
       * 1. @see https://app.asana.com/0/1204313444805313/1207549197964321/f
       * 2. leverageWithoutPnl may be zero if sizeInUsd is defaulted to 0n when position not ready yet
       */
      leverageWithoutPnl !== undefined && leverageWithoutPnl !== 0n
        ? remainingCollateralUsd -
          (nextSizeInUsd * BASIS_POINTS_DIVISOR_BIGINT) / leverageWithoutPnl
        : 0n
    values.collateralDeltaAmount = convertUsdToTokenAmount(
      values.collateralDeltaUsd,
      collateralToken.decimals,
      values.collateralPrice,
    )
    values.receiveTokenAmount = payedInfo.outputAmount + values.collateralDeltaAmount
  } else {
    values.collateralDeltaUsd = 0n
    values.collateralDeltaAmount = 0n
    values.receiveTokenAmount = payedInfo.outputAmount
  }

  values.receiveUsd = convertTokenAmountToUsd(
    values.receiveTokenAmount,
    collateralToken.decimals,
    values.collateralPrice,
  )

  return values
}

function getDecreaseSwapType(pnlToken: Token, collateralToken: Token, receiveToken: Token) {
  if (isEquivalentTokens(pnlToken, collateralToken)) {
    return DecreasePositionSwapType.NoSwap
  }

  if (isEquivalentTokens(pnlToken, receiveToken)) {
    return DecreasePositionSwapType.SwapCollateralTokenToPnlToken
  }

  return DecreasePositionSwapType.SwapPnlTokenToCollateralToken
}

function applyAcceptablePrice(p: {
  marketInfo: MarketData
  isLong: boolean
  isTrigger: boolean
  fixedAcceptablePriceImpactBps?: bigint | undefined
  acceptablePriceImpactBuffer?: number | undefined
  values: DecreasePositionAmounts
  tokenPricesData: TokenPricesData
}) {
  const {
    marketInfo,
    isLong,
    values,
    isTrigger,
    fixedAcceptablePriceImpactBps,
    acceptablePriceImpactBuffer,
    tokenPricesData,
  } = p

  const acceptablePriceInfo = getAcceptablePriceInfo({
    marketInfo,
    isIncrease: false,
    isLong,
    indexPrice: values.indexPrice,
    sizeDeltaUsd: values.sizeDeltaUsd,
    tokenPricesData,
  })

  values.positionPriceImpactDeltaUsd = acceptablePriceInfo.priceImpactDeltaUsd
  values.acceptablePrice = acceptablePriceInfo.acceptablePrice
  values.acceptablePriceDeltaBps = acceptablePriceInfo.acceptablePriceDeltaBps
  values.priceImpactDiffUsd = acceptablePriceInfo.priceImpactDiffUsd

  if (isTrigger) {
    if (values.triggerOrderType === OrderType.StopLossDecrease) {
      if (isLong) {
        values.acceptablePrice = 0n
      } else {
        values.acceptablePrice = MAX_UINT256
      }
    } else {
      let maxNegativePriceImpactBps = fixedAcceptablePriceImpactBps
      values.recommendedAcceptablePriceDeltaBps = getDefaultAcceptablePriceImpactBps({
        isIncrease: false,
        isLong,
        indexPrice: values.indexPrice,
        sizeDeltaUsd: values.sizeDeltaUsd,
        priceImpactDeltaUsd: values.positionPriceImpactDeltaUsd,
        acceptablePriceImpactBuffer:
          acceptablePriceImpactBuffer ?? DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER,
      })

      if (maxNegativePriceImpactBps === undefined) {
        maxNegativePriceImpactBps = values.recommendedAcceptablePriceDeltaBps
      }

      const triggerAcceptablePriceInfo = getAcceptablePriceInfo({
        marketInfo,
        isIncrease: false,
        isLong,
        indexPrice: values.indexPrice,
        sizeDeltaUsd: values.sizeDeltaUsd,
        maxNegativePriceImpactBps,
        tokenPricesData,
      })

      values.acceptablePrice = triggerAcceptablePriceInfo.acceptablePrice
      values.acceptablePriceDeltaBps = triggerAcceptablePriceInfo.acceptablePriceDeltaBps
    }
  }

  return values
}

export function estimateCollateralCost(
  baseUsd: bigint,
  collateralToken: Token,
  collateralPrice: bigint,
  collateralTokenPrice: Price,
) {
  const amount = convertUsdToTokenAmount(
    baseUsd,
    collateralToken.decimals,
    collateralTokenPrice.min,
  )
  const usd = convertTokenAmountToUsd(amount, collateralToken.decimals, collateralPrice)

  return {
    amount,
    usd,
  }
}

export function isFullClose(p: {
  position: PositionInfo
  sizeDeltaUsd: bigint
  indexPrice: bigint
  remainingCollateralUsd: bigint
  minCollateralUsd: bigint
  minPositionSizeUsd: bigint
  tokenPricesData: TokenPricesData
}) {
  const {
    position,
    sizeDeltaUsd,
    indexPrice,
    remainingCollateralUsd,
    minCollateralUsd,
    minPositionSizeUsd,
    tokenPricesData,
  } = p
  const {marketData, isLong} = position

  if (position.sizeInUsd - sizeDeltaUsd < DUST_USD) {
    return true
  }

  const estimatedPnl = getPositionPnlUsd({
    marketInfo: marketData,
    tokenPricesData,
    sizeInUsd: position.sizeInUsd,
    sizeInTokens: position.sizeInTokens,
    markPrice: indexPrice,
    isLong,
  })

  const realizedPnl = (estimatedPnl * sizeDeltaUsd) / position.sizeInUsd

  const estimatedRemainingPnl = estimatedPnl - realizedPnl

  if (realizedPnl < 0) {
    const estimatedRemainingCollateralUsd = remainingCollateralUsd - realizedPnl

    let minCollateralFactor = isLong
      ? marketData.minCollateralFactorForOpenInterestLong
      : marketData.minCollateralFactorForOpenInterestShort

    const minCollateralFactorForMarket = marketData.minCollateralFactor

    if (minCollateralFactorForMarket > minCollateralFactor) {
      minCollateralFactor = minCollateralFactorForMarket
    }

    const minCollateralUsdForLeverage = applyFactor(position.sizeInUsd, minCollateralFactor)
    const willCollateralBeSufficient =
      estimatedRemainingCollateralUsd >= minCollateralUsdForLeverage

    if (!willCollateralBeSufficient) {
      if (
        estimatedRemainingCollateralUsd + estimatedRemainingPnl < minCollateralUsd ||
        position.sizeInUsd - sizeDeltaUsd < minPositionSizeUsd
      ) {
        return true
      }
    }
  }

  return false
}

export function payForCollateralCost(p: {
  initialCostUsd: bigint
  collateralToken: Token
  collateralPrice: bigint
  outputAmount: bigint
  remainingCollateralAmount: bigint
}) {
  const {
    initialCostUsd,
    collateralToken,
    collateralPrice,
    outputAmount,
    remainingCollateralAmount,
  } = p

  const values = {
    outputAmount: BigInt(outputAmount),
    remainingCollateralAmount: BigInt(remainingCollateralAmount),
    paidOutputAmount: 0n,
    paidRemainingCollateralAmount: 0n,
  }

  let remainingCostAmount = convertUsdToTokenAmount(
    initialCostUsd,
    collateralToken.decimals,
    collateralPrice,
  )

  if (remainingCostAmount === 0n) {
    return values
  }

  if (values.outputAmount > 0) {
    if (values.outputAmount > remainingCostAmount) {
      values.outputAmount = values.outputAmount - remainingCostAmount
      values.paidOutputAmount = remainingCostAmount
      remainingCostAmount = 0n
    } else {
      remainingCostAmount = remainingCostAmount - values.outputAmount
      values.paidOutputAmount = values.outputAmount
      values.outputAmount = 0n
    }
  }

  if (remainingCostAmount === 0n) {
    return values
  }

  if (values.remainingCollateralAmount > remainingCostAmount) {
    values.remainingCollateralAmount = values.remainingCollateralAmount - remainingCostAmount
    values.paidRemainingCollateralAmount = remainingCostAmount
  } else {
    values.paidRemainingCollateralAmount = values.remainingCollateralAmount
    values.remainingCollateralAmount = 0n
  }

  return values
}
