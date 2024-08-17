import type {BigNumberish} from 'starknet'
import {formatUnits} from 'viem'

import limitDecimals from './limitDecimals'
import trimZeroDecimals from './trimZeroDecimals'

export default function formatAmountFree(
  amount: BigNumberish,
  tokenDecimals: number,
  displayDecimals?: number,
) {
  let amountStr = formatUnits(BigInt(amount), tokenDecimals)
  amountStr = limitDecimals(amountStr, displayDecimals)
  return trimZeroDecimals(amountStr)
}
