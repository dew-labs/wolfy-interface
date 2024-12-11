import type {StarknetChainId} from 'wolfy-sdk'

import {getTokenMetadata} from '@/constants/tokens'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import type {TokensRatio} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import getTokensRatioByPrice from '@/lib/trade/utils/token/getTokensRatioByPrice'

import type {TradeFlags} from './getTradeFlags'

export default function getTradeRatios({
  chainId,
  tradeFlags,
  fromTokenAddress,
  toTokenAddress,
  tokenPrice,
  tokenPricesData,
}: {
  chainId: StarknetChainId
  tradeFlags: TradeFlags
  fromTokenAddress: string | undefined
  toTokenAddress: string | undefined
  tokenPrice: bigint | undefined
  tokenPricesData: TokenPricesData | undefined
}) {
  const {isSwap, isLong, isIncrease} = tradeFlags
  if (!isSwap || !fromTokenAddress || !toTokenAddress || !tokenPricesData) return {}

  const toToken = getTokenMetadata(chainId, toTokenAddress)
  const toTokenPrice = tokenPricesData.get(toToken.address) ?? undefined
  const fromToken = getTokenMetadata(chainId, fromTokenAddress)
  const fromTokenPrice = tokenPricesData.get(fromToken.address) ?? undefined

  if (fromTokenPrice === undefined || toTokenPrice === undefined) return {}

  const markPrice = getMarkPrice({price: toTokenPrice, isIncrease, isLong})
  const triggerRatioValue = tokenPrice

  if (!markPrice) return {}

  const markRatio = getTokensRatioByPrice({
    fromToken,
    toToken,
    fromPrice: fromTokenPrice.min,
    toPrice: markPrice,
  })

  if (triggerRatioValue === undefined) {
    return {markRatio}
  }

  const triggerRatio: TokensRatio = {
    ratio: triggerRatioValue > 0n ? triggerRatioValue : markRatio.ratio,
    largestToken: markRatio.largestToken,
    smallestToken: markRatio.smallestToken,
  }

  return {
    markRatio,
    triggerRatio,
  }
}
