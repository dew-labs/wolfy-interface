import type {Token} from '@/constants/tokens'

export default function isEquivalentTokens(token1: Token, token2: Token) {
  if (token1.address === token2.address) {
    return true
  }

  return token1.symbol === token2.symbol
}
