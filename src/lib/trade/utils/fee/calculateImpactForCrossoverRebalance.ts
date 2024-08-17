import abs from '@/utils/numbers/bigint/abs'

import applyImpactFactor from './applyImpactFactor'

export default function calculateImpactForCrossoverRebalance(p: {
  currentDiff: bigint
  nextDiff: bigint
  factorPositive: bigint
  factorNegative: bigint
  exponentFactor: bigint
}) {
  const {currentDiff, nextDiff, factorNegative, factorPositive, exponentFactor} = p

  const positiveImpact = applyImpactFactor(currentDiff, factorPositive, exponentFactor)
  const negativeImpactUsd = applyImpactFactor(nextDiff, factorNegative, exponentFactor)

  const deltaDiffUsd = abs(positiveImpact - negativeImpactUsd)

  return positiveImpact > negativeImpactUsd ? deltaDiffUsd : -deltaDiffUsd
}
