import formatAmount from './formatAmount'
import formatAmountFree from './formatAmountFree'
import getLimitedDisplay from './getLimitedDisplay'

export default function formatTokenAmount(
  amount?: bigint,
  tokenDecimals?: number,
  symbol?: string,
  opts: {
    showAllSignificant?: boolean
    displayDecimals?: number
    fallbackToZero?: boolean
    useCommas?: boolean
    minThreshold?: string
    maxThreshold?: string
    displayPlus?: boolean
  } = {},
) {
  const {
    displayDecimals = 4,
    showAllSignificant = false,
    fallbackToZero = false,
    useCommas = false,
    minThreshold = '0',
    maxThreshold,
  } = opts

  const symbolStr = symbol ? ` ${symbol}` : ''

  if (typeof amount !== 'bigint' || !tokenDecimals) {
    if (fallbackToZero) {
      amount = 0n
      tokenDecimals = displayDecimals
    } else {
      return undefined
    }
  }

  let amountStr: string

  const maybePlus = opts.displayPlus ? '+' : ''
  const sign = amount < 0n ? '-' : maybePlus

  if (showAllSignificant) {
    amountStr = formatAmountFree(amount, tokenDecimals, tokenDecimals)
  } else {
    const exceedingInfo = getLimitedDisplay(amount, tokenDecimals, {maxThreshold, minThreshold})
    const symbol = exceedingInfo.symbol ? `${exceedingInfo.symbol} ` : ''
    amountStr = `${symbol}${sign}${formatAmount(exceedingInfo.value, tokenDecimals, displayDecimals, useCommas)}`
  }

  return `${amountStr}${symbolStr}`
}
