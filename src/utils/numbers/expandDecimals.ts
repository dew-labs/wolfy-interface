export default function expandDecimals(n: bigint | number, decimals: number | bigint): bigint {
  return BigInt(n) * 10n ** BigInt(decimals)
}
