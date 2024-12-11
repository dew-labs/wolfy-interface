import invariant from 'tiny-invariant'

import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {getTotalSwapVolumeFromSwapStats} from '@/lib/trade/utils/fee/getTotalSwapVolumeFromSwapStats'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import {getAmountByRatio} from '@/lib/trade/utils/token/getAmountByRatio'
import type {TokensRatio} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'

import type {FindSwapPath, SwapAmounts} from './types'

export function getSwapAmountsByFromValue(p: {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  triggerRatio?: TokensRatio
  isLimit: boolean
  findSwapPath: FindSwapPath
  uiFeeFactor: bigint
  tokenPricesData: TokenPricesData
}): SwapAmounts {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    triggerRatio,
    isLimit,
    findSwapPath,
    uiFeeFactor,
    tokenPricesData,
  } = p

  const priceIn = tokenPricesData.get(tokenIn.address)?.min
  const priceOut = tokenPricesData.get(tokenOut.address)?.max

  invariant(priceIn && priceOut, 'Price not found')

  const usdIn = convertTokenAmountToUsd(amountIn, tokenIn.decimals, priceIn)

  let amountOut = 0n
  let usdOut = 0n
  let minOutputAmount = 0n

  const defaultAmounts: SwapAmounts = {
    amountIn,
    usdIn,
    amountOut,
    usdOut,
    minOutputAmount,
    priceIn,
    priceOut,
    swapPathStats: undefined,
  }

  if (amountIn <= 0) {
    return defaultAmounts
  }

  if (isEquivalentTokens(tokenIn, tokenOut)) {
    amountOut = amountIn
    usdOut = usdIn
    minOutputAmount = amountOut

    return {
      amountIn,
      usdIn,
      amountOut,
      usdOut,
      minOutputAmount,
      priceIn,
      priceOut,
      swapPathStats: undefined,
    }
  }

  const swapPathStats = findSwapPath(defaultAmounts.usdIn, {byLiquidity: isLimit})

  const totalSwapVolume = getTotalSwapVolumeFromSwapStats(swapPathStats?.swapSteps)
  const swapUiFeeUsd = applyFactor(totalSwapVolume, uiFeeFactor)
  const swapUiFeeAmount = convertUsdToTokenAmount(swapUiFeeUsd, tokenOut.decimals, priceOut)

  if (!swapPathStats) {
    return defaultAmounts
  }

  if (isLimit) {
    if (!triggerRatio) {
      return defaultAmounts
    }

    amountOut = getAmountByRatio({
      fromToken: tokenIn,
      toToken: tokenOut,
      fromTokenAmount: amountIn,
      ratio: triggerRatio.ratio,
      shouldInvertRatio: triggerRatio.largestToken.address === tokenOut.address,
    })

    usdOut = convertTokenAmountToUsd(amountOut, tokenOut.decimals, priceOut)
    usdOut =
      usdOut -
      swapPathStats.totalSwapFeeUsd -
      swapUiFeeUsd +
      swapPathStats.totalSwapPriceImpactDeltaUsd
    amountOut = convertUsdToTokenAmount(usdOut, tokenOut.decimals, priceOut)
    minOutputAmount = amountOut
  } else {
    usdOut = swapPathStats.usdOut - swapUiFeeUsd
    amountOut = swapPathStats.amountOut - swapUiFeeAmount
    minOutputAmount = amountOut
  }

  if (amountOut < 0) {
    amountOut = 0n
    usdOut = 0n
    minOutputAmount = 0n
  }

  return {
    amountIn,
    usdIn,
    amountOut,
    usdOut,
    priceIn,
    priceOut,
    minOutputAmount,
    swapPathStats,
  }
}
