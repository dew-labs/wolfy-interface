import type {BigNumberish} from 'starknet'

export function numberWithCommas(x: BigNumberish) {
  const parts = x.toString().split('.')
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')
  }
  return parts.join('.')
}
