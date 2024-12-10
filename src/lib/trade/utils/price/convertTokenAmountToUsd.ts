import expandDecimals from '@/utils/numbers/expandDecimals'

export default function convertTokenAmountToUsd(
  tokenAmount: bigint = 0n,
  tokenDecimals: number = 0,
  price: bigint = 0n,
) {
  if (tokenAmount === 0n || price === 0n) return 0n

  return (tokenAmount * price) / expandDecimals(1n, tokenDecimals)
}
