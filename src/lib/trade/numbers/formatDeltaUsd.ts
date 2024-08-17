import abs from '@/utils/numbers/bigint/abs'

import {USD_DECIMALS} from './constants'
import formatAmount from './formatAmount'
import formatPercentage from './formatPercentage'
import formatUsd from './formatUsd'
import getLimitedDisplay from './getLimitedDisplay'
import getPlusOrMinusSymbol from './getPlusOrMinusSymbol'

export default function formatDeltaUsd(
  deltaUsd?: bigint,
  percentage?: bigint,
  opts: {fallbackToZero?: boolean; showPlusForZero?: boolean} = {},
) {
  if (typeof deltaUsd !== 'bigint') {
    if (opts.fallbackToZero) {
      return `${formatUsd(0n)} (${formatAmount(0n, 2, 2)}%)`
    }

    return undefined
  }

  const sign = getPlusOrMinusSymbol(deltaUsd, {showPlusForZero: opts.showPlusForZero})

  const exceedingInfo = getLimitedDisplay(deltaUsd, USD_DECIMALS)
  const percentageStr = percentage ? ` (${sign}${formatPercentage(abs(percentage))})` : ''
  const deltaUsdStr = formatAmount(exceedingInfo.value, USD_DECIMALS, 2, true)
  const symbol = exceedingInfo.symbol ? `${exceedingInfo.symbol} ` : ''

  return `${symbol}${sign}$${deltaUsdStr}${percentageStr}`
}
