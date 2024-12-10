export default function roundUpDivision(a: bigint, b: bigint) {
  return (a + b - 1n) / b
}
