export default function getPlusOrMinusSymbol(
  value?: bigint,
  opts: {showPlusForZero?: boolean | undefined} = {},
): string {
  if (value === undefined) {
    return ''
  }

  const {showPlusForZero = false} = opts
  return value === 0n ? (showPlusForZero ? '+' : '') : value < 0n ? '-' : '+'
}
