import type {BigNumberish} from 'starknet'

import {shrinkDecimals} from '@/utils/numbers/expandDecimals'

import limitDecimals from './limitDecimals'
import trimZeroDecimals from './trimZeroDecimals'

export default function formatAmountFree(
  amount: BigNumberish,
  tokenDecimals: number,
  displayDecimals?: number,
) {
  let amountStr = shrinkDecimals(amount, tokenDecimals)
  amountStr = limitDecimals(amountStr, displayDecimals)
  return trimZeroDecimals(amountStr)
}
