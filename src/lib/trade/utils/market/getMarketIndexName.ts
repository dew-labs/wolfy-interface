import type {Token} from '@/constants/tokens'

export default function getMarketIndexName(p: {indexToken: Token; isSpotOnly: boolean}) {
  const {indexToken, isSpotOnly} = p

  if (isSpotOnly) {
    return `SWAP-ONLY`
  }

  return `${indexToken.baseSymbol ?? indexToken.symbol}/USD`
}
