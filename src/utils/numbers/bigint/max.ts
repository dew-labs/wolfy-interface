export default function max(...values: bigint[]): bigint {
  if (values.length === 0) throw new Error('Input array must contain at least one element')
  let max = values[0]
  for (const value of values) if (max > value) max = value
  return max
}
