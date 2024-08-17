import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {type TokensData} from '@/lib/trade/services/fetchTokensData'

export default function calculatePriceDecimals(
  tokenAddress: string,
  tokensData: TokensData,
  decimals = USD_DECIMALS,
) {
  const token = tokensData.get(tokenAddress)

  if (!token) return

  const price = token.price.min

  if (price === 0n) return 2
  const priceNumber = Number(price.toString()) / Math.pow(10, decimals)

  if (isNaN(priceNumber)) return 2
  if (priceNumber >= 1000) return 2
  if (priceNumber >= 100) return 3
  if (priceNumber >= 1) return 4
  if (priceNumber >= 0.1) return 5
  if (priceNumber >= 0.01) return 6
  if (priceNumber >= 0.0001) return 7

  return 8
}
