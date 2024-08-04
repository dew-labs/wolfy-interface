export default function min(...values: bigint[]): bigint {
  if (values.length === 0) throw new Error('Input array must contain at least one element')
  let min = values[0]
  for (const v of values) if (v < min) min = v
  return min
}
