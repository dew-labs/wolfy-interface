import type {Token} from '@/constants/tokens'
import {PRECISION} from '@/lib/trade/numbers/constants'
import expandDecimals from '@/utils/numbers/expandDecimals'

import isEquivalentTokens from './isEquivalentTokens'

export function getAmountByRatio(p: {
  fromToken: Token
  toToken: Token
  fromTokenAmount: bigint
  ratio: bigint
  shouldInvertRatio?: boolean
}) {
  const {fromToken, toToken, fromTokenAmount, ratio, shouldInvertRatio} = p

  if (isEquivalentTokens(fromToken, toToken) || fromTokenAmount === 0n) {
    return p.fromTokenAmount
  }

  const ratio2 = shouldInvertRatio ? (PRECISION * PRECISION) / ratio : ratio

  const adjustedDecimalsRatio =
    (ratio2 * expandDecimals(1, toToken.decimals)) / expandDecimals(1, fromToken.decimals)

  return (p.fromTokenAmount * adjustedDecimalsRatio) / PRECISION
}
