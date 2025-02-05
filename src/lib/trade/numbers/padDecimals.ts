import type {BigNumberish} from 'starknet'

export const padDecimals = (amount: BigNumberish, minDecimals: number) => {
  let amountStr = amount.toString()

  const dotIndex = amountStr.indexOf('.')

  const foundDot = dotIndex !== -1

  if (foundDot) {
    const decimals = amountStr.length - dotIndex - 1
    if (decimals < minDecimals) {
      amountStr = amountStr.padEnd(amountStr.length + (minDecimals - decimals), '0')
    }
  } else {
    amountStr = `${amountStr}.${Array.from({length: minDecimals}).fill('0').join('')}`
  }
  return amountStr
}
