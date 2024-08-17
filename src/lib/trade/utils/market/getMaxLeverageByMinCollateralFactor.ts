import {BASIS_POINTS_DIVISOR, PRECISION} from '@/lib/trade/numbers/constants'

export function getMaxLeverageByMinCollateralFactor(minCollateralFactor: bigint | undefined) {
  if (minCollateralFactor === undefined) return 100 * BASIS_POINTS_DIVISOR
  if (minCollateralFactor === 0n) return 100 * BASIS_POINTS_DIVISOR

  const x = Number(PRECISION / minCollateralFactor)
  const rounded = Math.round(x / 10) * 10
  return rounded * BASIS_POINTS_DIVISOR
}
