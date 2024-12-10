export default function getPlusOrMinusSymbol(
  value?: bigint,
  opts: {showPlusForZero?: boolean | undefined} = {},
): string {
  if (value === undefined) {
    return ''
  }

  const {showPlusForZero = false} = opts

  if (value === 0n) {
    return showPlusForZero ? '+' : ''
  }

  return value < 0n ? '-' : '+'
}
