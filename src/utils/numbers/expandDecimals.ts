import type {BigNumberish} from 'starknet'

import {roundToNDecimal} from './roundToNDecimals'

export default function expandDecimals(
  value: BigNumberish | undefined,
  decimals: number | bigint,
): bigint {
  if (!value) return 0n

  if (typeof value === 'number') return BigInt(value.toFixed(Number(decimals)).replace('.', ''))
  if (typeof value === 'bigint') return value * 10n ** BigInt(decimals)

  const valueString = value.replace(/[^0-9.]/g, '')

  const dotIndex = valueString.indexOf('.')

  const foundDot = dotIndex !== -1

  const decimalPart = (foundDot ? valueString.slice(dotIndex + 1) : '')
    .padEnd(Number(decimals), '0')
    .slice(0, Number(decimals))

  const integerPart = foundDot ? valueString.slice(0, dotIndex) : valueString

  return BigInt(integerPart + decimalPart)
}

export function shrinkDecimals(
  value: BigNumberish | undefined,
  decimals: number | bigint,
  roundToDecimal?: number,
): string {
  if (!value) return '0'

  decimals = Number(decimals)
  let display = (() => {
    if (typeof value === 'number') return String(BigInt(Math.round(value)))
    if (typeof value === 'string') return String(BigInt(parseInt(value)))
    return String(value)
  })()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  display = display.padStart(decimals, '0')

  const integer = display.slice(0, display.length - decimals)

  let fraction = display.slice(display.length - decimals)
  fraction = fraction.replace(/0+$/, '')

  const result = `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`

  if (roundToDecimal === undefined) return result
  return String(roundToNDecimal(result, roundToDecimal))
}
