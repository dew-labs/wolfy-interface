import abs from '@/utils/numbers/bigint/abs'

import applyImpactFactor from './applyImpactFactor'

export default function calculateImpactForSameSideRebalance(p: {
  currentDiff: bigint
  nextDiff: bigint
  hasPositiveImpact: boolean
  factor: bigint
  exponentFactor: bigint
}) {
  const {currentDiff, nextDiff, hasPositiveImpact, factor, exponentFactor} = p

  const currentImpact = applyImpactFactor(currentDiff, factor, exponentFactor)
  const nextImpact = applyImpactFactor(nextDiff, factor, exponentFactor)

  const deltaDiff = abs(currentImpact - nextImpact)

  return hasPositiveImpact ? deltaDiff : -deltaDiff
}
