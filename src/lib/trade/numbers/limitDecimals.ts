import type {BigNumberish} from 'starknet'

export default function limitDecimals(amount: BigNumberish, maxDecimals?: number) {
  let amountStr = amount.toString()
  if (maxDecimals === undefined) {
    return amountStr
  }
  if (maxDecimals === 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
    return amountStr.split('.')[0]!
  }
  const dotIndex = amountStr.indexOf('.')
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1
    if (decimals > maxDecimals) {
      amountStr = amountStr.substring(0, amountStr.length - (decimals - maxDecimals))
    }
  }

  return amountStr
}
