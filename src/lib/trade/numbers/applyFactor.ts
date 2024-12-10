import {PRECISION} from './constants'

export function applyFactor(value: bigint = 0n, factor: bigint = 0n) {
  return (value * factor) / PRECISION
}
