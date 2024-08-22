import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {getOppositeCollateral} from '@/lib/trade/utils/market/getOppositeCollateral'

import getSwapStats from './getStapStats'

export interface SwapStats {
  marketAddress: string
  tokenInAddress: string
  tokenOutAddress: string
  isOutLiquidity?: boolean
  swapFeeAmount: bigint
  swapFeeUsd: bigint
  priceImpactDeltaUsd: bigint
  amountIn: bigint
  amountInAfterFees: bigint
  usdIn: bigint
  amountOut: bigint
  usdOut: bigint
}

export interface SwapPathStats {
  swapPath: string[]
  swapSteps: SwapStats[]
  targetMarketAddress?: string
  totalSwapPriceImpactDeltaUsd: bigint
  totalSwapFeeUsd: bigint
  totalFeesDeltaUsd: bigint
  tokenInAddress: string
  tokenOutAddress: string
  usdOut: bigint
  amountOut: bigint
}

export default function getSwapPathStats(p: {
  marketsData: MarketsData
  tokenPricesData: TokenPricesData
  swapPath: string[]
  initialCollateralAddress: string
  usdIn: bigint
  shouldApplyPriceImpact: boolean
}): SwapPathStats | undefined {
  const {
    marketsData,
    swapPath,
    initialCollateralAddress,
    usdIn,
    shouldApplyPriceImpact,
    tokenPricesData,
  } = p

  if (swapPath.length === 0) {
    return undefined
  }

  const swapSteps: SwapStats[] = []

  let usdOut = usdIn

  let tokenInAddress = initialCollateralAddress
  let tokenOutAddress = initialCollateralAddress

  let totalSwapPriceImpactDeltaUsd = 0n
  let totalSwapFeeUsd = 0n

  for (const swapItem of swapPath) {
    const marketAddress = swapItem
    const marketInfo = marketsData.get(marketAddress)
    if (!marketInfo) continue

    const oppositeCollateral = getOppositeCollateral(marketInfo, tokenInAddress)
    if (!oppositeCollateral) continue

    tokenOutAddress = oppositeCollateral.address

    const swapStep = getSwapStats({
      marketInfo,
      tokenPricesData,
      tokenInAddress,
      tokenOutAddress,
      usdIn: usdOut,
      shouldApplyPriceImpact,
    })

    tokenInAddress = swapStep.tokenOutAddress
    usdOut = swapStep.usdOut

    totalSwapPriceImpactDeltaUsd = totalSwapPriceImpactDeltaUsd + swapStep.priceImpactDeltaUsd
    totalSwapFeeUsd = totalSwapFeeUsd + swapStep.swapFeeUsd

    swapSteps.push(swapStep)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed to exist
  const lastStep = swapSteps[swapSteps.length - 1]!
  const targetMarketAddress = lastStep.marketAddress
  const amountOut = lastStep.amountOut

  const totalFeesDeltaUsd = 0n - totalSwapFeeUsd + totalSwapPriceImpactDeltaUsd

  return {
    swapPath,
    tokenInAddress,
    tokenOutAddress,
    targetMarketAddress,
    swapSteps,
    usdOut,
    amountOut,
    totalSwapFeeUsd,
    totalSwapPriceImpactDeltaUsd,
    totalFeesDeltaUsd,
  }
}
