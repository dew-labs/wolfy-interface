import formatAmount from '@/lib/trade/numbers/formatAmount'
import abs from '@/utils/numbers/bigint/abs'

import getPlusOrMinusSymbol from './getPlusOrMinusSymbol'

export default function formatPercentage(
  percentage?: bigint,
  opts: {fallbackToZero?: boolean; signed?: boolean} = {},
) {
  const {fallbackToZero = false, signed = false} = opts

  if (typeof percentage !== 'bigint') {
    if (fallbackToZero) {
      return `${formatAmount(0n, 2, 2)}%`
    }

    return undefined
  }

  const sign = signed ? getPlusOrMinusSymbol(percentage) : ''

  return `${sign}${formatAmount(abs(percentage), 2, 2)}%`
}
