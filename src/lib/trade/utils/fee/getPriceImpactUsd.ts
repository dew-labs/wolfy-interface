import abs from '@/utils/numbers/bigint/abs'

import calculateImpactForCrossoverRebalance from './calculateImpactForCrossoverRebalance'
import calculateImpactForSameSideRebalance from './calculateImpactForSameSideRebalance'

export default function getPriceImpactUsd(p: {
  currentLongUsd: bigint
  currentShortUsd: bigint
  nextLongUsd: bigint
  nextShortUsd: bigint
  factorPositive: bigint
  factorNegative: bigint
  exponentFactor: bigint
  fallbackToZero?: boolean | undefined
}) {
  const {nextLongUsd, nextShortUsd} = p

  if (nextLongUsd < 0 || nextShortUsd < 0) {
    if (p.fallbackToZero) {
      return 0n
    }
    throw new Error('Negative pool amount')
  }

  const currentDiff = abs(p.currentLongUsd - p.currentShortUsd)
  const nextDiff = abs(nextLongUsd - nextShortUsd)

  const isSameSideRebalance = p.currentLongUsd < p.currentShortUsd === nextLongUsd < nextShortUsd

  let impactUsd: bigint

  if (isSameSideRebalance) {
    const hasPositiveImpact = nextDiff < currentDiff
    const factor = hasPositiveImpact ? p.factorPositive : p.factorNegative

    impactUsd = calculateImpactForSameSideRebalance({
      currentDiff,
      nextDiff,
      hasPositiveImpact,
      factor,
      exponentFactor: p.exponentFactor,
    })
  } else {
    impactUsd = calculateImpactForCrossoverRebalance({
      currentDiff,
      nextDiff,
      factorPositive: p.factorPositive,
      factorNegative: p.factorNegative,
      exponentFactor: p.exponentFactor,
    })
  }

  return impactUsd
}
