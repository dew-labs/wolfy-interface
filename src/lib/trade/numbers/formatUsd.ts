import {USD_DECIMALS} from './constants'
import formatAmount from './formatAmount'
import getLimitedDisplay from './getLimitedDisplay'

export default function formatUsd(
  usd?: bigint,
  opts: {
    fallbackToZero?: boolean | undefined
    displayDecimals?: number | undefined
    maxThreshold?: string | null
    minThreshold?: string | undefined
    displayPlus?: boolean | undefined
  } = {},
) {
  const {fallbackToZero = false, displayDecimals = 2} = opts

  if (typeof usd !== 'bigint') {
    if (fallbackToZero) {
      usd = 0n
    } else {
      return undefined
    }
  }

  const defaultMinThreshold =
    displayDecimals > 1 ? '0.' + '0'.repeat(displayDecimals - 1) + '1' : undefined

  const exceedingInfo = getLimitedDisplay(usd, USD_DECIMALS, {
    maxThreshold: opts.maxThreshold,
    minThreshold: opts.minThreshold ?? defaultMinThreshold,
  })

  const maybePlus = opts.displayPlus ? '+' : ''
  const sign = usd < 0n ? '-' : maybePlus
  const symbol = exceedingInfo.symbol ? `${exceedingInfo.symbol} ` : ''
  const displayUsd = formatAmount(exceedingInfo.value, USD_DECIMALS, displayDecimals, true)
  return `${symbol}${sign}$${displayUsd}`
}
