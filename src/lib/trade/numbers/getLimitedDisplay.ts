import abs from '@/utils/numbers/bigint/abs'
import expandDecimals from '@/utils/numbers/expandDecimals'

import {MAX_EXCEEDING_THRESHOLD, MIN_EXCEEDING_THRESHOLD} from './constants'

export const TRIGGER_PREFIX_ABOVE = '>'
export const TRIGGER_PREFIX_BELOW = '<'

export default function getLimitedDisplay(
  amount: bigint,
  tokenDecimals: number,
  opts: {maxThreshold?: string | undefined | null; minThreshold?: string | undefined} = {},
) {
  const {maxThreshold = MAX_EXCEEDING_THRESHOLD, minThreshold = MIN_EXCEEDING_THRESHOLD} = opts
  const max = maxThreshold === null ? null : expandDecimals(maxThreshold, tokenDecimals)
  const min = expandDecimals(minThreshold, tokenDecimals)
  const absAmount = abs(amount)

  if (absAmount == 0n) {
    return {
      symbol: '',
      value: absAmount,
    }
  }

  const symbol =
    max !== null && absAmount > max
      ? TRIGGER_PREFIX_ABOVE
      : absAmount < min
        ? TRIGGER_PREFIX_BELOW
        : ''
  const value = max !== null && absAmount > max ? max : absAmount < min ? min : absAmount

  return {
    symbol,
    value,
  }
}
