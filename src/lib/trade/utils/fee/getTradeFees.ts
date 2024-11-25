import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'
import type {SwapStats} from '@/lib/trade/utils/order/swap/getSwapPathStats'
import abs from '@/utils/numbers/bigint/abs'

import {type FeeItem, getFeeItem} from './getFeeItem'
import {getTotalFeeItem} from './getTotalFeeItem'
import {getTotalSwapVolumeFromSwapStats} from './getTotalSwapVolumeFromSwapStats'

export type SwapFeeItem = FeeItem & {
  marketAddress: string
  tokenInAddress: string
  tokenOutAddress: string
}

export interface TradeFees {
  totalFees?: FeeItem
  payTotalFees?: FeeItem
  swapFees?: SwapFeeItem[] | undefined
  positionFee?: FeeItem | undefined
  swapPriceImpact?: FeeItem | undefined
  positionPriceImpact?: FeeItem | undefined
  priceImpactDiff?: FeeItem | undefined
  positionCollateralPriceImpact?: FeeItem | undefined
  collateralPriceImpactDiff?: FeeItem | undefined
  positionFeeFactor?: bigint
  borrowFee?: FeeItem | undefined
  fundingFee?: FeeItem | undefined
  uiFee?: FeeItem | undefined
  uiSwapFee?: FeeItem | undefined
  feeDiscountUsd?: bigint
  swapProfitFee?: FeeItem | undefined
}

export function getTradeFees(p: {
  initialCollateralUsd: bigint
  sizeDeltaUsd: bigint
  collateralDeltaUsd: bigint
  swapSteps: SwapStats[]
  positionFeeUsd: bigint
  swapPriceImpactDeltaUsd: bigint
  positionPriceImpactDeltaUsd: bigint
  priceImpactDiffUsd: bigint
  borrowingFeeUsd: bigint
  fundingFeeUsd: bigint
  feeDiscountUsd: bigint
  swapProfitFeeUsd: bigint
  uiFeeFactor: bigint
}): TradeFees {
  const {
    initialCollateralUsd,
    sizeDeltaUsd,
    collateralDeltaUsd,
    swapSteps,
    positionFeeUsd,
    swapPriceImpactDeltaUsd,
    positionPriceImpactDeltaUsd,
    priceImpactDiffUsd,
    borrowingFeeUsd,
    fundingFeeUsd,
    feeDiscountUsd,
    swapProfitFeeUsd,
    uiFeeFactor,
  } = p

  const swapFees: SwapFeeItem[] | undefined =
    initialCollateralUsd > 0
      ? swapSteps.map(step => ({
          tokenInAddress: step.tokenInAddress,
          tokenOutAddress: step.tokenOutAddress,
          marketAddress: step.marketAddress,
          deltaUsd: step.swapFeeUsd * -1n,
          bps: step.usdIn != 0n ? getBasisPoints(step.swapFeeUsd * -1n, step.usdIn) : 0n,
        }))
      : undefined

  const totalSwapVolumeUsd = getTotalSwapVolumeFromSwapStats(swapSteps)
  const uiFeeUsd = applyFactor(sizeDeltaUsd, uiFeeFactor)
  const uiSwapFeeUsd = applyFactor(totalSwapVolumeUsd, uiFeeFactor)

  const uiSwapFee = getFeeItem(uiSwapFeeUsd * -1n, totalSwapVolumeUsd, {
    shouldRoundUp: true,
  })
  const uiFee = getFeeItem(uiFeeUsd * -1n, sizeDeltaUsd, {shouldRoundUp: true})

  const swapProfitFee = getFeeItem(swapProfitFeeUsd * -1n, initialCollateralUsd)

  const swapPriceImpact = getFeeItem(swapPriceImpactDeltaUsd, initialCollateralUsd)

  const positionFeeBeforeDiscount = getFeeItem(
    (positionFeeUsd + feeDiscountUsd) * -1n,
    sizeDeltaUsd,
  )
  const positionFeeAfterDiscount = getFeeItem(positionFeeUsd * -1n, sizeDeltaUsd)

  const borrowFee = getFeeItem(borrowingFeeUsd * -1n, initialCollateralUsd)

  const fundingFee = getFeeItem(fundingFeeUsd * -1n, initialCollateralUsd)
  const positionPriceImpact = getFeeItem(positionPriceImpactDeltaUsd, sizeDeltaUsd)
  const priceImpactDiff = getFeeItem(priceImpactDiffUsd, sizeDeltaUsd)

  const positionCollateralPriceImpact = getFeeItem(
    positionPriceImpactDeltaUsd,
    abs(collateralDeltaUsd),
  )
  const collateralPriceImpactDiff = getFeeItem(priceImpactDiffUsd, collateralDeltaUsd)

  const totalFees = getTotalFeeItem([
    ...(swapFees ?? []),
    swapProfitFee,
    swapPriceImpact,
    positionFeeAfterDiscount,
    borrowFee,
    fundingFee,
    uiFee,
    uiSwapFee,
  ])

  const payTotalFees = getTotalFeeItem([
    ...(swapFees ?? []),
    swapProfitFee,
    swapPriceImpact,
    positionFeeAfterDiscount,
    borrowFee,
    fundingFee,
    uiFee,
    uiSwapFee,
  ])

  return {
    totalFees,
    payTotalFees,
    swapFees,
    swapProfitFee,
    swapPriceImpact,
    positionFee: positionFeeBeforeDiscount,
    positionPriceImpact,
    priceImpactDiff,
    positionCollateralPriceImpact,
    collateralPriceImpactDiff,
    borrowFee,
    fundingFee,
    feeDiscountUsd,
    uiFee,
    uiSwapFee,
  }
}
