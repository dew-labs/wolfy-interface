export default function roundToNDecimal(n: string | number | bigint, decimals = 2) {
  const precision = 10 ** decimals
  return Math.round(Number(n) * precision) / precision
}
