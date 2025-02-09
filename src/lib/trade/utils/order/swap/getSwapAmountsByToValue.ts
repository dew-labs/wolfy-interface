import invariant from 'tiny-invariant'

import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import {getAmountByRatio} from '@/lib/trade/utils/token/getAmountByRatio'
import type {TokensRatio} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import isEquivalentTokens from '@/lib/trade/utils/token/isEquivalentTokens'

import type {FindSwapPath, SwapAmounts} from './types'

export function getSwapAmountsByToValue(p: {
  tokenIn: Token
  tokenOut: Token
  amountOut: bigint
  triggerRatio?: TokensRatio
  isLimit: boolean
  findSwapPath: FindSwapPath
  uiFeeFactor: bigint
  tokenPricesData: TokenPricesData
}): SwapAmounts {
  const {
    tokenIn,
    tokenOut,
    amountOut,
    triggerRatio,
    isLimit,
    findSwapPath,
    uiFeeFactor,
    tokenPricesData,
  } = p

  const priceIn = tokenPricesData.get(tokenIn.address)?.min
  const priceOut = tokenPricesData.get(tokenOut.address)?.max

  invariant(priceIn && priceOut, 'Price not found')

  const usdOut = convertTokenAmountToUsd(amountOut, tokenOut.decimals, priceOut)
  const uiFeeUsd = applyFactor(usdOut, uiFeeFactor)

  const minOutputAmount = amountOut

  let amountIn = 0n
  let usdIn = 0n

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

  if (amountOut <= 0) {
    return defaultAmounts
  }

  if (isEquivalentTokens(tokenIn, tokenOut)) {
    amountIn = amountOut
    usdIn = usdOut

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

  const baseUsdIn = usdOut
  const swapPathStats = findSwapPath(baseUsdIn, {byLiquidity: isLimit})

  if (!swapPathStats) {
    return defaultAmounts
  }

  if (isLimit) {
    if (!triggerRatio) {
      return defaultAmounts
    }

    amountIn = getAmountByRatio({
      fromToken: tokenOut,
      toToken: tokenIn,
      fromTokenAmount: amountOut,
      ratio: triggerRatio.ratio,
      shouldInvertRatio: triggerRatio.largestToken.address === tokenIn.address,
    })

    usdIn = convertTokenAmountToUsd(amountIn, tokenIn.decimals, priceIn)
    usdIn =
      usdIn + swapPathStats.totalSwapFeeUsd + uiFeeUsd - swapPathStats.totalSwapPriceImpactDeltaUsd
    amountIn = convertUsdToTokenAmount(usdIn, tokenIn.decimals, priceIn)
  } else {
    const adjustedUsdIn =
      swapPathStats.usdOut > 0 ? (baseUsdIn * usdOut) / swapPathStats.usdOut : 0n

    usdIn = adjustedUsdIn + uiFeeUsd
    amountIn = convertUsdToTokenAmount(usdIn, tokenIn.decimals, priceIn)
  }

  if (amountIn < 0) {
    amountIn = 0n
    usdIn = 0n
  }

  return {amountIn, usdIn, amountOut, usdOut, minOutputAmount, priceIn, priceOut, swapPathStats}
}
