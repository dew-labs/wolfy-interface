import type {BigNumber} from 'bignumber.js'

import expandDecimals from './expandDecimals'

export default function bigNumberToBigInt(bigNumber: BigNumber, decimals: number | bigint) {
  return expandDecimals(bigNumber.toFixed(Number(decimals)), decimals)
}
