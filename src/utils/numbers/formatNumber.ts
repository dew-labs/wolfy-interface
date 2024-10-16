import formatLocaleNumber from './formatLocaleNumber'

export enum Format {
  PLAIN,
  READABLE,
  USD,
  USD_ABBREVIATED,
  PERCENT,
  PERCENT_SIGNED,
}

export default function formatNumber(
  number: string | number | bigint,
  format: Format,
  options?: {
    fractionDigits?: number | undefined
    exactFractionDigits?: boolean
  },
) {
  switch (format) {
    case Format.PLAIN:
      return formatLocaleNumber(Number(number), 'en-US', {
        useGrouping: false,
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      })
    case Format.READABLE:
      return formatLocaleNumber(Number(number), 'en-US', {
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      })
    case Format.USD:
      return formatLocaleNumber(Number(number), 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 0,
      })
    case Format.USD_ABBREVIATED:
      return formatLocaleNumber(Number(number), 'en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: options?.fractionDigits ?? 2,
        minimumFractionDigits: options?.exactFractionDigits ? options.fractionDigits : 2,
      })
    case Format.PERCENT:
      return formatLocaleNumber(Number(number), 'en-US', {
        style: 'percent',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    case Format.PERCENT_SIGNED:
      return formatLocaleNumber(Number(number), 'en-US', {
        style: 'percent',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        signDisplay: 'exceptZero',
      })
  }
}
