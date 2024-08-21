import type {BigNumberish} from 'starknet'

import {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import limitDecimals from './limitDecimals'
import {numberWithCommas} from './numberWithCommas'
import {padDecimals} from './padDecimals'

export default function formatAmount(
  amount: BigNumberish | undefined,
  tokenDecimals: number,
  displayDecimals?: number,
  useCommas?: boolean,
  defaultValue?: string,
) {
  if (defaultValue === undefined) {
    defaultValue = '...'
  }

  if (amount === undefined || amount === '') {
    return defaultValue
  }

  if (displayDecimals === undefined) {
    displayDecimals = 4
  }

  let amountStr = shrinkDecimals(amount, tokenDecimals)

  amountStr = limitDecimals(amountStr, displayDecimals)
  if (displayDecimals !== 0) {
    amountStr = padDecimals(amountStr, displayDecimals)
  }

  if (useCommas) {
    return numberWithCommas(amountStr)
  }

  return amountStr
}
