import {USD_DECIMALS} from '@/lib/trade/numbers/constants'

export default function calculatePriceFractionDigits(
  price?: bigint | number,
  decimals = USD_DECIMALS,
) {
  if (!price) return 2

  if (price === 0n) return 2
  const priceNumber = Number(price.toString()) / 10 ** decimals

  if (Number.isNaN(priceNumber)) return 2
  if (priceNumber >= 10) return 2
  if (priceNumber >= 1) return 3
  if (priceNumber >= 0.1) return 4
  if (priceNumber >= 0.01) return 5
  if (priceNumber >= 0.001) return 6
  if (priceNumber >= 0.0001) return 7

  return 8
}
