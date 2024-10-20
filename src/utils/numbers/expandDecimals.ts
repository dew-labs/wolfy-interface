import type {BigNumberish} from 'starknet'

export default function expandDecimals(
  value: BigNumberish | undefined,
  decimals: number | bigint,
): bigint {
  if (!value) return 0n

  if (typeof value === 'number') return BigInt(value.toFixed(Number(decimals)).replace('.', ''))
  if (typeof value === 'bigint') return value * 10n ** BigInt(decimals)

  const valueString = value.replace(/[^0-9.]/g, '')

  const dotIndex = valueString.indexOf('.')

  const decimalPart = (dotIndex !== -1 ? valueString.slice(dotIndex + 1) : '')
    .padEnd(Number(decimals), '0')
    .slice(0, Number(decimals))

  const integerPart = dotIndex !== -1 ? valueString.slice(0, dotIndex) : valueString

  return BigInt(integerPart + decimalPart)
}

export function shrinkDecimals(value: BigNumberish | undefined, decimals: number | bigint): string {
  if (!value) return '0'

  decimals = Number(decimals)
  let display = (() => {
    if (typeof value === 'number') return value.toFixed(0)
    if (typeof value === 'string') return parseInt(value).toFixed(0)
    return String(value)
  })()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  display = display.padStart(decimals, '0')

  const integer = display.slice(0, display.length - decimals)

  let fraction = display.slice(display.length - decimals)
  fraction = fraction.replace(/0+$/, '')

  return `${negative ? '-' : ''}${integer || '0'}${fraction ? '.' + fraction : ''}`
}
