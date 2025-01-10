import {OrderType} from 'wolfy-sdk'

import {LEVERAGE_PRECISION} from '@/constants/config'
import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import {getTotalSwapVolumeFromSwapStats} from '@/lib/trade/utils/fee/getTotalSwapVolumeFromSwapStats'
import getTriggerThresholdType, {
  type TriggerThresholdType,
} from '@/lib/trade/utils/order/getTriggerThresholdType'
import {getSwapAmountsByFromValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByFromValue'
import {getSwapAmountsByToValue} from '@/lib/trade/utils/order/swap/getSwapAmountsByToValue'
import type {SwapPathStats} from '@/lib/trade/utils/order/swap/getSwapPathStats'
import type {FindSwapPath} from '@/lib/trade/utils/order/swap/types'
import getLeverage from '@/lib/trade/utils/position/getLeverage'
import type {PositionInfo} from '@/lib/trade/utils/position/getPositionsInfo'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import getAcceptablePriceInfo from '@/lib/trade/utils/price/getAcceptablePriceInfo'
import getDefaultAcceptablePriceImpactBps from '@/lib/trade/utils/price/getDefaultAcceptablePriceImpactBps'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'

export interface IncreasePositionAmounts {
  initialCollateralAmount: bigint
  initialCollateralUsd: bigint

  collateralDeltaAmount: bigint
  collateralDeltaUsd: bigint

  swapPathStats: SwapPathStats | undefined

  collateralTokenAmount: bigint

  sizeDeltaUsd: bigint
  sizeDeltaInTokens: bigint

  estimatedLeverage?: bigint | undefined

  collateralPrice: bigint
  initialCollateralPrice: bigint
  triggerPrice?: bigint
  triggerThresholdType?: TriggerThresholdType
  acceptablePrice: bigint
  acceptablePriceDeltaBps: bigint

  positionFeeUsd: bigint
  uiFeeUsd: bigint
  swapUiFeeUsd: bigint
  feeDiscountUsd: bigint
  borrowingFeeUsd: bigint
  fundingFeeUsd: bigint
  positionPriceImpactDeltaUsd: bigint
}

export function getIncreasePositionAmounts(p: {
  marketInfo: MarketData
  initialCollateralToken: Token
  initialCollateralAmount: bigint | undefined
  collateralToken: Token
  collateralTokenAmount: bigint | undefined
  isLong: boolean
  position: PositionInfo | undefined
  leverage?: bigint
  triggerPrice?: bigint | undefined
  acceptablePriceImpactBuffer?: number
  fixedAcceptablePriceImpactBps?: bigint
  userReferralInfo?: ReferralInfo | undefined | null
  strategy: 'leverageBySize' | 'leverageByCollateral' | 'independent'
  findSwapPath: FindSwapPath
  uiFeeFactor: bigint
  tokenPricesData: TokenPricesData
}): IncreasePositionAmounts {
  const {
    marketInfo,
    initialCollateralToken,
    initialCollateralAmount,
    collateralToken,
    collateralTokenAmount,
    isLong,
    leverage,
    triggerPrice,
    position,
    fixedAcceptablePriceImpactBps,
    acceptablePriceImpactBuffer,
    findSwapPath,
    userReferralInfo,
    uiFeeFactor,
    strategy,
    tokenPricesData,
  } = p

  const values: IncreasePositionAmounts = {
    initialCollateralAmount: 0n,
    initialCollateralUsd: 0n,

    collateralDeltaAmount: 0n,
    collateralDeltaUsd: 0n,

    swapPathStats: undefined,

    collateralTokenAmount: 0n,

    sizeDeltaUsd: 0n,
    sizeDeltaInTokens: 0n,

    estimatedLeverage: 0n,

    collateralPrice: 0n,
    initialCollateralPrice: 0n,
    triggerPrice: 0n,
    acceptablePrice: 0n,
    acceptablePriceDeltaBps: 0n,

    positionFeeUsd: 0n,
    uiFeeUsd: 0n,
    swapUiFeeUsd: 0n,
    feeDiscountUsd: 0n,
    borrowingFeeUsd: 0n,
    fundingFeeUsd: 0n,
    positionPriceImpactDeltaUsd: 0n,
  }

  const initialCollateralPrice = tokenPricesData.get(initialCollateralToken.address)
  const collateralTokenPrice = tokenPricesData.get(collateralToken.address)

  if (!initialCollateralPrice || !collateralTokenPrice) {
    return values
  }

  const isLimit = !!(triggerPrice !== undefined && triggerPrice > 0)

  if (isLimit) {
    values.triggerPrice = triggerPrice
    values.triggerThresholdType = getTriggerThresholdType(OrderType.LimitIncrease, isLong)

    values.collateralPrice = triggerPrice

    values.initialCollateralPrice = isEquivalentTokens(collateralToken, initialCollateralToken)
      ? triggerPrice
      : initialCollateralPrice.min
  } else {
    values.collateralPrice = getMarkPrice({price: collateralTokenPrice, isIncrease: true, isLong})
    values.initialCollateralPrice = initialCollateralPrice.min
  }

  values.borrowingFeeUsd = position?.pendingBorrowingFeesUsd ?? 0n
  values.fundingFeeUsd = position?.pendingFundingFeesUsd ?? 0n

  if (values.collateralPrice <= 0 || values.initialCollateralPrice <= 0) {
    return values
  }

  // Size and collateral
  if (
    strategy === 'leverageByCollateral' &&
    leverage !== undefined &&
    initialCollateralAmount !== undefined &&
    initialCollateralAmount > 0
  ) {
    values.estimatedLeverage = leverage

    values.initialCollateralAmount = initialCollateralAmount
    values.initialCollateralUsd = convertTokenAmountToUsd(
      initialCollateralAmount,
      initialCollateralToken.decimals,
      values.initialCollateralPrice,
    )

    const swapAmounts = getSwapAmountsByFromValue({
      tokenIn: initialCollateralToken,
      amountIn: initialCollateralAmount,
      tokenOut: collateralToken,
      isLimit: false,
      findSwapPath,
      uiFeeFactor,
      tokenPricesData,
    })

    values.swapPathStats = swapAmounts.swapPathStats

    const baseCollateralUsd = convertTokenAmountToUsd(
      swapAmounts.amountOut,
      collateralToken.decimals,
      values.collateralPrice,
    )
    const baseSizeDeltaUsd = (baseCollateralUsd * leverage) / LEVERAGE_PRECISION
    const basePriceImpactDeltaUsd = getPriceImpactForPosition(marketInfo, baseSizeDeltaUsd, isLong)
    const basePositionFeeInfo = getPositionFee(
      marketInfo,
      baseSizeDeltaUsd,
      basePriceImpactDeltaUsd > 0,
      userReferralInfo,
    )
    const baseUiFeeUsd = applyFactor(baseSizeDeltaUsd, uiFeeFactor)
    const totalSwapVolumeUsd = getTotalSwapVolumeFromSwapStats(values.swapPathStats?.swapSteps)
    values.swapUiFeeUsd = applyFactor(totalSwapVolumeUsd, uiFeeFactor)

    values.sizeDeltaUsd =
      ((baseCollateralUsd -
        basePositionFeeInfo.positionFeeUsd -
        baseUiFeeUsd -
        values.swapUiFeeUsd) *
        leverage) /
      LEVERAGE_PRECISION

    values.collateralTokenAmount = convertUsdToTokenAmount(
      values.sizeDeltaUsd,
      collateralToken.decimals,
      values.collateralPrice,
    )

    const positionFeeInfo = getPositionFee(
      marketInfo,
      values.sizeDeltaUsd,
      basePriceImpactDeltaUsd > 0,
      userReferralInfo,
    )
    values.positionFeeUsd = positionFeeInfo.positionFeeUsd
    values.feeDiscountUsd = positionFeeInfo.discountUsd
    values.uiFeeUsd = applyFactor(values.sizeDeltaUsd, uiFeeFactor)

    values.collateralDeltaUsd =
      baseCollateralUsd -
      values.positionFeeUsd -
      values.borrowingFeeUsd -
      values.fundingFeeUsd -
      values.uiFeeUsd -
      values.swapUiFeeUsd

    values.collateralDeltaAmount = convertUsdToTokenAmount(
      values.collateralDeltaUsd,
      collateralToken.decimals,
      values.collateralPrice,
    )
  } else if (
    strategy === 'leverageBySize' &&
    leverage !== undefined &&
    collateralTokenAmount !== undefined &&
    collateralTokenAmount > 0
  ) {
    values.estimatedLeverage = leverage
    values.collateralTokenAmount = collateralTokenAmount
    values.sizeDeltaUsd = convertTokenAmountToUsd(
      collateralTokenAmount,
      collateralToken.decimals,
      values.collateralPrice,
    )

    const basePriceImpactDeltaUsd = getPriceImpactForPosition(
      marketInfo,
      values.sizeDeltaUsd,
      isLong,
    )

    const positionFeeInfo = getPositionFee(
      marketInfo,
      values.sizeDeltaUsd,
      basePriceImpactDeltaUsd > 0,
      userReferralInfo,
    )

    values.positionFeeUsd = positionFeeInfo.positionFeeUsd
    values.feeDiscountUsd = positionFeeInfo.discountUsd
    values.uiFeeUsd = applyFactor(values.sizeDeltaUsd, uiFeeFactor)

    values.collateralDeltaUsd = (values.sizeDeltaUsd * LEVERAGE_PRECISION) / leverage

    values.collateralDeltaAmount = convertUsdToTokenAmount(
      values.collateralDeltaUsd,
      collateralToken.decimals,
      values.collateralPrice,
    )

    const baseCollateralUsd =
      values.collateralDeltaUsd +
      values.positionFeeUsd +
      values.borrowingFeeUsd +
      values.fundingFeeUsd +
      values.uiFeeUsd +
      values.swapUiFeeUsd

    const baseCollateralAmount = convertUsdToTokenAmount(
      baseCollateralUsd,
      collateralToken.decimals,
      values.collateralPrice,
    )

    const swapAmounts = getSwapAmountsByToValue({
      tokenIn: initialCollateralToken,
      tokenOut: collateralToken,
      amountOut: baseCollateralAmount,
      isLimit: false,
      findSwapPath,
      uiFeeFactor,
      tokenPricesData,
    })

    values.swapPathStats = swapAmounts.swapPathStats

    values.initialCollateralAmount = swapAmounts.amountIn
    values.initialCollateralUsd = convertTokenAmountToUsd(
      values.initialCollateralAmount,
      initialCollateralToken.decimals,
      values.initialCollateralPrice,
    )
  } else if (strategy === 'independent') {
    if (collateralTokenAmount !== undefined && collateralTokenAmount > 0) {
      values.collateralTokenAmount = collateralTokenAmount
      values.sizeDeltaUsd = convertTokenAmountToUsd(
        collateralTokenAmount,
        collateralToken.decimals,
        values.collateralPrice,
      )

      const basePriceImpactDeltaUsd = getPriceImpactForPosition(
        marketInfo,
        values.sizeDeltaUsd,
        isLong,
      )

      const positionFeeInfo = getPositionFee(
        marketInfo,
        values.sizeDeltaUsd,
        basePriceImpactDeltaUsd > 0,
        userReferralInfo,
      )

      values.positionFeeUsd = positionFeeInfo.positionFeeUsd
      values.feeDiscountUsd = positionFeeInfo.discountUsd
      values.uiFeeUsd = applyFactor(values.sizeDeltaUsd, uiFeeFactor)
    }

    if (initialCollateralAmount !== undefined && initialCollateralAmount > 0) {
      values.initialCollateralAmount = initialCollateralAmount
      values.initialCollateralUsd = convertTokenAmountToUsd(
        initialCollateralAmount,
        initialCollateralToken.decimals,
        values.initialCollateralPrice,
      )

      const swapAmounts = getSwapAmountsByFromValue({
        tokenIn: initialCollateralToken,
        tokenOut: collateralToken,
        amountIn: initialCollateralAmount,
        isLimit: false,
        findSwapPath,
        uiFeeFactor,
        tokenPricesData,
      })

      values.swapPathStats = swapAmounts.swapPathStats
      values.swapUiFeeUsd = applyFactor(
        getTotalSwapVolumeFromSwapStats(values.swapPathStats?.swapSteps),
        uiFeeFactor,
      )

      const baseCollateralUsd = convertTokenAmountToUsd(
        swapAmounts.amountOut,
        collateralToken.decimals,
        values.collateralPrice,
      )

      values.collateralDeltaUsd =
        baseCollateralUsd -
        values.positionFeeUsd -
        values.borrowingFeeUsd -
        values.fundingFeeUsd -
        values.uiFeeUsd -
        values.swapUiFeeUsd

      values.collateralDeltaAmount = convertUsdToTokenAmount(
        values.collateralDeltaUsd,
        collateralToken.decimals,
        values.collateralPrice,
      )
    }

    values.estimatedLeverage = getLeverage({
      sizeInUsd: values.sizeDeltaUsd,
      collateralUsd: values.collateralDeltaUsd,
      pnl: 0n,
      pendingBorrowingFeesUsd: 0n,
      pendingFundingFeesUsd: 0n,
    })
  }

  const acceptablePriceInfo = getAcceptablePriceInfo({
    marketInfo,
    isIncrease: true,
    isLong,
    indexPrice: values.collateralPrice,
    sizeDeltaUsd: values.sizeDeltaUsd,
    tokenPricesData,
  })

  values.positionPriceImpactDeltaUsd = acceptablePriceInfo.priceImpactDeltaUsd
  values.acceptablePrice = acceptablePriceInfo.acceptablePrice
  values.acceptablePriceDeltaBps = acceptablePriceInfo.acceptablePriceDeltaBps

  if (isLimit) {
    let maxNegativePriceImpactBps = fixedAcceptablePriceImpactBps
    if (maxNegativePriceImpactBps === undefined) {
      maxNegativePriceImpactBps = getDefaultAcceptablePriceImpactBps({
        isIncrease: true,
        isLong,
        indexPrice: values.collateralPrice,
        sizeDeltaUsd: values.sizeDeltaUsd,
        priceImpactDeltaUsd: values.positionPriceImpactDeltaUsd,
        acceptablePriceImpactBuffer,
      })
    }

    const limitAcceptablePriceInfo = getAcceptablePriceInfo({
      marketInfo,
      isIncrease: true,
      isLong,
      indexPrice: values.collateralPrice,
      sizeDeltaUsd: values.sizeDeltaUsd,
      maxNegativePriceImpactBps,
      tokenPricesData,
    })

    values.acceptablePrice = limitAcceptablePriceInfo.acceptablePrice
    values.acceptablePriceDeltaBps = limitAcceptablePriceInfo.acceptablePriceDeltaBps
  }

  let priceImpactAmount

  if (values.positionPriceImpactDeltaUsd > 0) {
    const price =
      triggerPrice !== undefined && triggerPrice > 0 ? triggerPrice : collateralTokenPrice.max
    priceImpactAmount = convertUsdToTokenAmount(
      values.positionPriceImpactDeltaUsd,
      collateralToken.decimals,
      price,
    )
  } else {
    const price =
      triggerPrice !== undefined && triggerPrice > 0 ? triggerPrice : collateralTokenPrice.min
    priceImpactAmount = convertUsdToTokenAmount(
      values.positionPriceImpactDeltaUsd,
      collateralToken.decimals,
      price,
    )
  }

  values.sizeDeltaInTokens = convertUsdToTokenAmount(
    values.sizeDeltaUsd,
    collateralToken.decimals,
    values.collateralPrice,
  )

  if (isLong) {
    values.sizeDeltaInTokens = values.sizeDeltaInTokens + priceImpactAmount
  } else {
    values.sizeDeltaInTokens = values.sizeDeltaInTokens - priceImpactAmount
  }

  return values
}
