import {BASIS_POINTS_DIVISOR_BIGINT, PRECISION} from './constants'

export function basisPointsToFloat(basisPoints: bigint) {
  return (basisPoints * PRECISION) / BASIS_POINTS_DIVISOR_BIGINT
}
