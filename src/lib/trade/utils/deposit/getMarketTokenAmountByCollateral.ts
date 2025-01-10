import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import {applySwapImpactWithCap} from '@/lib/trade/utils/fee/applySwapImpactWithCap'
import usdToMarketTokenAmount from '@/lib/trade/utils/market/usdToMarketTokenAmount'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

export default function getMarketTokenAmountByCollateral(p: {
  marketInfo: MarketData
  marketToken: MarketTokenData
  tokenIn: Token
  tokenInPrice: Price
  tokenOut: Token
  tokenOutPrice: Price
  amount: bigint
  priceImpactDeltaUsd: bigint
  swapFeeUsd: bigint
  uiFeeUsd: bigint
}): bigint {
  const {
    marketInfo,
    marketToken,
    tokenIn,
    tokenInPrice,
    tokenOut,
    tokenOutPrice,
    amount,
    priceImpactDeltaUsd,
    swapFeeUsd,
    uiFeeUsd,
  } = p

  const swapFeeAmount = convertUsdToTokenAmount(swapFeeUsd, tokenIn.decimals, tokenInPrice.min)
  const uiFeeAmount = convertUsdToTokenAmount(uiFeeUsd, tokenIn.decimals, tokenInPrice.min)

  let amountInAfterFees = amount - swapFeeAmount - uiFeeAmount
  let mintAmount = 0n

  if (priceImpactDeltaUsd > 0) {
    const {impactDeltaAmount: positiveImpactAmount} = applySwapImpactWithCap(
      marketInfo,
      tokenOut,
      tokenOutPrice,
      priceImpactDeltaUsd,
    )

    const usdValue = convertTokenAmountToUsd(
      positiveImpactAmount,
      tokenOut.decimals,
      tokenOutPrice.min,
    )

    mintAmount =
      mintAmount +
      // TODO: poolValue for deposit
      usdToMarketTokenAmount(marketInfo, marketToken, usdValue)
  } else {
    const {impactDeltaAmount: negativeImpactAmount} = applySwapImpactWithCap(
      marketInfo,
      tokenIn,
      tokenInPrice,
      priceImpactDeltaUsd,
    )
    amountInAfterFees = amountInAfterFees + negativeImpactAmount
  }

  const usdValue = convertTokenAmountToUsd(amountInAfterFees, tokenIn.decimals, tokenInPrice.min)
  mintAmount = mintAmount + usdToMarketTokenAmount(marketInfo, marketToken, usdValue)

  return mintAmount
}
