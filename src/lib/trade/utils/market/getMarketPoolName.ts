import {type Token} from '@/constants/tokens'

export default function getMarketPoolName(p: {longToken: Token; shortToken: Token}) {
  const {longToken, shortToken} = p

  if (longToken.address === shortToken.address) {
    return longToken.symbol
  }

  return `${longToken.symbol}-${shortToken.symbol}`
}
