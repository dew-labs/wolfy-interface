import type {Token} from '@/constants/tokens'
import {PRECISION} from '@/lib/trade/numbers/constants'
import expandDecimals from '@/utils/numbers/expandDecimals'

export interface TokensRatio {
  ratio: bigint
  largestToken: Token
  smallestToken: Token
}

export default function getTokensRatioByAmounts(p: {
  fromToken: Token
  toToken: Token
  fromTokenAmount: bigint
  toTokenAmount: bigint
}): TokensRatio {
  const {fromToken, toToken, fromTokenAmount, toTokenAmount} = p

  const adjustedFromAmount = (fromTokenAmount * PRECISION) / expandDecimals(1, fromToken.decimals)
  const adjustedToAmount = (toTokenAmount * PRECISION) / expandDecimals(1, toToken.decimals)

  const [smallestToken, largestToken, largestAmount, smallestAmount] =
    adjustedFromAmount > adjustedToAmount
      ? [fromToken, toToken, adjustedFromAmount, adjustedToAmount]
      : [toToken, fromToken, adjustedToAmount, adjustedFromAmount]

  const ratio = smallestAmount > 0 ? (largestAmount * PRECISION) / smallestAmount : 0n

  return {ratio, largestToken, smallestToken}
}
