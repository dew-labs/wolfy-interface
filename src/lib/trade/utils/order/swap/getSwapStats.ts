import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {applySwapImpactWithCap} from '@/lib/trade/utils/fee/applySwapImpactWithCap'
import getPriceImpactForSwap from '@/lib/trade/utils/fee/getPriceImpactForSwap'
import getSwapFee from '@/lib/trade/utils/fee/getSwapFee'
import getAvailableUsdLiquidityForCollateral from '@/lib/trade/utils/market/getAvailableUsdLiquidityForCollateral'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

import type {SwapStats} from './getSwapPathStats'

export default function getSwapStats(p: {
  marketInfo: MarketData
  tokenPricesData: TokenPricesData
  tokenInAddress: string
  tokenOutAddress: string
  usdIn: bigint
  shouldApplyPriceImpact: boolean
}): SwapStats {
  const {
    marketInfo,
    tokenInAddress,
    tokenOutAddress,
    usdIn,
    shouldApplyPriceImpact,
    tokenPricesData,
  } = p

  const tokenIn =
    getTokenPoolType(marketInfo, tokenInAddress) === 'long'
      ? marketInfo.longToken
      : marketInfo.shortToken

  const tokenOut =
    getTokenPoolType(marketInfo, tokenOutAddress) === 'long'
      ? marketInfo.longToken
      : marketInfo.shortToken

  const tokenInPrice = tokenPricesData.get(tokenIn.address)
  const tokenOutPrice = tokenPricesData.get(tokenOut.address)

  if (!tokenInPrice || !tokenOutPrice) throw new Error('Token prices not found')

  const priceIn = tokenInPrice.min
  const priceOut = tokenOutPrice.max

  const amountIn = convertUsdToTokenAmount(usdIn, tokenIn.decimals, priceIn)

  let priceImpactDeltaUsd: bigint

  try {
    priceImpactDeltaUsd = getPriceImpactForSwap(
      marketInfo,
      tokenIn,
      tokenOut,
      tokenInPrice,
      tokenOutPrice,
      usdIn,
      usdIn * -1n,
    )
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

  let cappedImpactDeltaUsd: bigint

  if (priceImpactDeltaUsd > 0) {
    const {impactDeltaAmount: positiveImpactAmountTokenOut, cappedDiffUsd} = applySwapImpactWithCap(
      marketInfo,
      tokenOut,
      tokenOutPrice,
      priceImpactDeltaUsd,
    )
    cappedImpactDeltaUsd = convertTokenAmountToUsd(
      positiveImpactAmountTokenOut,
      tokenOut.decimals,
      priceOut,
    )

    // https://github.com/gmx-io/gmx-synthetics/blob/3df10f1eab2734cf1b5f0a5dff12b79cbb19907d/contracts/swap/SwapUtils.sol#L290-L291
    if (cappedDiffUsd > 0) {
      const {impactDeltaAmount: positiveImpactAmountTokenIn} = applySwapImpactWithCap(
        marketInfo,
        tokenIn,
        tokenInPrice,
        cappedDiffUsd,
      )
      if (positiveImpactAmountTokenIn > 0) {
        cappedImpactDeltaUsd += convertTokenAmountToUsd(
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
      tokenInPrice,
      priceImpactDeltaUsd,
    )
    cappedImpactDeltaUsd = convertTokenAmountToUsd(negativeImpactAmount, tokenIn.decimals, priceIn)
  }

  if (shouldApplyPriceImpact) {
    usdOut = usdOut + cappedImpactDeltaUsd
  }

  if (usdOut < 0) {
    usdOut = 0n
  }

  const amountOut = convertUsdToTokenAmount(usdOut, tokenOut.decimals, priceOut)

  const liquidity = getAvailableUsdLiquidityForCollateral(
    marketInfo,
    tokenPricesData,
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
