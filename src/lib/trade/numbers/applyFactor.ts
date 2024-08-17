import {PRECISION} from './constants'

export function applyFactor(value: bigint, factor: bigint) {
  return (value * factor) / PRECISION
}
