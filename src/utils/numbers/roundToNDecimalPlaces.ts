import round from './bigint/round'

export default function roundToNDecimalPlaces(n: bigint, places: bigint | number = 2) {
  const precision = 10n ** BigInt(places)
  return round(n * precision) / precision
}
