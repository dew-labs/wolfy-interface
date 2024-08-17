import expandDecimals from '@/utils/numbers/expandDecimals'

export default function applyImpactFactor(diff: bigint, factor: bigint, exponent: bigint) {
  // Convert diff and exponent to float js numbers
  const __diff = Number(diff) / 10 ** 30
  const __exponent = Number(exponent) / 10 ** 30

  // Pow and convert back to BigInt with 30 decimals
  let result = BigInt(Math.round(__diff ** __exponent * 10 ** 30))

  result = (result * factor) / expandDecimals(1, 30)

  return result
}
