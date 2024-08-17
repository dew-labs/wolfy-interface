import {getMaxLeverageByMinCollateralFactor} from './getMaxLeverageByMinCollateralFactor'

export function getMaxAllowedLeverageByMinCollateralFactor(
  minCollateralFactor: bigint | undefined,
) {
  return getMaxLeverageByMinCollateralFactor(minCollateralFactor) / 2
}
