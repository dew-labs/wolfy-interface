import {BASIS_POINTS_DIVISOR_BIGINT} from './constants'

export function getBasisPoints(numerator: bigint, denominator: bigint, shouldRoundUp = false) {
  const result = (numerator * BASIS_POINTS_DIVISOR_BIGINT) / denominator

  if (shouldRoundUp) {
    const remainder = (numerator * BASIS_POINTS_DIVISOR_BIGINT) % denominator
    if (remainder !== 0n) {
      return result < 0n ? result - 1n : result + 1n
    }
  }

  return result
}
