import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import {applySwapImpactWithCap} from '@/lib/trade/utils/fee/applySwapImpactWithCap'
import getPriceImpactForSwap from '@/lib/trade/utils/fee/getPriceImpactForSwap'
import getSwapFee from '@/lib/trade/utils/fee/getSwapFee'
import getAvailableUsdLiquidityForCollateral from '@/lib/trade/utils/market/getAvailableUsdLiquidityForCollateral'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'
import convertPriceToTokenAmount from '@/lib/trade/utils/price/convertPriceToTokenAmount'
import convertPriceToUsd from '@/lib/trade/utils/price/convertPriceToUsd'

import type {SwapStats} from './getSwapPathStats'

export default function getSwapStats(p: {
  marketInfo: MarketData
  tokenInAddress: string
  tokenOutAddress: string
  usdIn: bigint
  shouldApplyPriceImpact: boolean
}): SwapStats {
  const {marketInfo, tokenInAddress, tokenOutAddress, usdIn, shouldApplyPriceImpact} = p

  const tokenIn =
    getTokenPoolType(marketInfo, tokenInAddress) === 'long'
      ? marketInfo.longToken
      : marketInfo.shortToken

  const tokenOut =
    getTokenPoolType(marketInfo, tokenOutAddress) === 'long'
      ? marketInfo.longToken
      : marketInfo.shortToken

  const priceIn = tokenIn.price.min
  const priceOut = tokenOut.price.max

  const amountIn = convertPriceToTokenAmount(usdIn, tokenIn.decimals, priceIn)

  let priceImpactDeltaUsd: bigint

  try {
    priceImpactDeltaUsd = getPriceImpactForSwap(marketInfo, tokenIn, tokenOut, usdIn, usdIn * -1n)
  } catch {
    return {
      swapFeeUsd: 0n,
      swapFeeAmount: 0n,
      marketAddress: marketInfo.marketTokenAddress,
      tokenInAddress,
      tokenOutAddress,
      priceImpactDeltaUsd: 0n,
      amountIn,
      amountInAfterFees: amountIn,
      usdIn,
      amountOut: 0n,
      usdOut: 0n,
      isOutLiquidity: true,
    }
  }

  const swapFeeAmount = getSwapFee(marketInfo, amountIn, priceImpactDeltaUsd > 0)
  const swapFeeUsd = getSwapFee(marketInfo, usdIn, priceImpactDeltaUsd > 0)

  const amountInAfterFees = amountIn - swapFeeAmount
  const usdInAfterFees = usdIn - swapFeeUsd

  let usdOut = usdInAfterFees
  let amountOut = convertPriceToTokenAmount(usdOut, tokenOut.decimals, priceOut)

  let cappedImpactDeltaUsd: bigint

  if (priceImpactDeltaUsd > 0) {
    const {impactDeltaAmount: positiveImpactAmountTokenOut, cappedDiffUsd} = applySwapImpactWithCap(
      marketInfo,
      tokenOut,
      priceImpactDeltaUsd,
    )
    cappedImpactDeltaUsd = convertPriceToUsd(
      positiveImpactAmountTokenOut,
      tokenOut.decimals,
      priceOut,
    )

    // https://github.com/gmx-io/gmx-synthetics/blob/3df10f1eab2734cf1b5f0a5dff12b79cbb19907d/contracts/swap/SwapUtils.sol#L290-L291
    if (cappedDiffUsd > 0) {
      const {impactDeltaAmount: positiveImpactAmountTokenIn} = applySwapImpactWithCap(
        marketInfo,
        tokenIn,
        cappedDiffUsd,
      )
      if (positiveImpactAmountTokenIn > 0) {
        cappedImpactDeltaUsd += convertPriceToUsd(
          positiveImpactAmountTokenIn,
          tokenIn.decimals,
          priceIn,
        )
      }
    }
  } else {
    const {impactDeltaAmount: negativeImpactAmount} = applySwapImpactWithCap(
      marketInfo,
      tokenIn,
      priceImpactDeltaUsd,
    )
    cappedImpactDeltaUsd = convertPriceToUsd(negativeImpactAmount, tokenIn.decimals, priceIn)
  }

  if (shouldApplyPriceImpact) {
    usdOut = usdOut + cappedImpactDeltaUsd
  }

  if (usdOut < 0) {
    usdOut = 0n
  }

  amountOut = convertPriceToTokenAmount(usdOut, tokenOut.decimals, priceOut)

  const liquidity = getAvailableUsdLiquidityForCollateral(
    marketInfo,
    getTokenPoolType(marketInfo, tokenOutAddress) === 'long',
  )

  const isOutLiquidity = liquidity < usdOut

  return {
    swapFeeUsd,
    swapFeeAmount,
    marketAddress: marketInfo.marketTokenAddress,
    tokenInAddress,
    tokenOutAddress,
    priceImpactDeltaUsd: cappedImpactDeltaUsd,
    amountIn,
    amountInAfterFees,
    usdIn,
    amountOut,
    usdOut,
    isOutLiquidity,
  }
}
