export default function max(...values: bigint[]): bigint {
  if (values.length === 0) throw new Error('Input array must contain at least one element')
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed non-null
  let max = values[0]!
  for (const value of values) if (value > max) max = value
  return max
}
