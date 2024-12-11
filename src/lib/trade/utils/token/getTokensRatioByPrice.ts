import type {Token} from '@/constants/tokens'
import {PRECISION} from '@/lib/trade/numbers/constants'

import type {TokensRatio} from './getTokensRatioByAmounts'

export default function getTokensRatioByPrice(p: {
  fromToken: Token
  toToken: Token
  fromPrice: bigint
  toPrice: bigint
}): TokensRatio {
  const {fromToken, toToken, fromPrice, toPrice} = p

  const [largestToken, smallestToken, largestPrice, smallestPrice] =
    fromPrice > toPrice
      ? [fromToken, toToken, fromPrice, toPrice]
      : [toToken, fromToken, toPrice, fromPrice]

  const ratio = (largestPrice * PRECISION) / smallestPrice

  return {ratio, largestToken, smallestToken}
}
