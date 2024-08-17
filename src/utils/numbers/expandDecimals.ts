import type {BigNumberish} from 'starknet'

export default function expandDecimals(n: BigNumberish, decimals: number | bigint): bigint {
  return BigInt(n) * 10n ** BigInt(decimals)
}
