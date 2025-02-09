type IntlFormat = Omit<Intl.NumberFormatOptions, 'notation'> & {
  notation?: Exclude<Intl.NumberFormatOptions['notation'], 'scientific' | 'engineering'>
}

import formatLocaleNumber from './formatLocaleNumber'

export const Format = {
  PLAIN: 'plain',
  READABLE: 'readable',
  USD: 'usd',
  USD_SIGNED: 'usd-signed',
  USD_ABBREVIATED: 'usd-abbreviated',
  PERCENT: 'percent',
  PERCENT_SIGNED: 'percent-signed',
} as const
export type Format = (typeof Format)[keyof typeof Format]

export interface FormatOptions {
  fractionDigits?: number | undefined
  exactFractionDigits?: boolean
}

export function getIntlNumberFormatOptions(format: Format, options?: FormatOptions): IntlFormat {
  switch (format) {
    case Format.PLAIN:
      return {
        useGrouping: false,
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      }
    case Format.READABLE:
      return {
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      }
    case Format.USD:
      return {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      }
    case Format.USD_SIGNED:
      return {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
        signDisplay: 'exceptZero',
      }
    case Format.USD_ABBREVIATED:
      return {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 2,
      }
    case Format.PERCENT:
      return {style: 'percent', maximumFractionDigits: 2, minimumFractionDigits: 2}
    case Format.PERCENT_SIGNED:
      return {
        style: 'percent',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        signDisplay: 'exceptZero',
      }
  }
}

export default function formatNumber(
  number: string | number | bigint,
  format: Format,
  options?: FormatOptions,
) {
  return formatLocaleNumber(Number(number), 'en-US', getIntlNumberFormatOptions(format, options))
}
