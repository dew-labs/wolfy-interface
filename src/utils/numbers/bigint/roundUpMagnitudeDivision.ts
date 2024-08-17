export default function roundUpMagnitudeDivision(a: bigint, b: bigint) {
  if (a < 0n) {
    return (a - b + 1n) / b
  }

  return (a + b - 1n) / b
}
