export default function formatLocaleNumber(
  n: number | bigint,
  locale: Intl.LocalesArgument = 'en-US',
  options?: Intl.NumberFormatOptions,
) {
  return Intl.NumberFormat(locale, options).format(n)
}
