import {USD_DECIMALS} from '@/lib/trade/numbers/constants'

export default function calculateTokenFractionDigits(price?: bigint, decimals = USD_DECIMALS) {
  if (!price) return 2

  if (price === 0n) return 2
  const priceNumber = Number(price.toString()) / 10 ** decimals

  if (priceNumber >= 1000) return 4
  if (priceNumber >= 100) return 3
  return 2
}
