import type {BigNumberish} from 'starknet'

export default function roundToNDecimal(n: BigNumberish, decimals = 2) {
  const precision = 10 ** decimals
  return Math.round(Number(n) * precision) / precision
}
