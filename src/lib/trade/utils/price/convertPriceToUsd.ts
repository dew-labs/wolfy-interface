import expandDecimals from '@/utils/numbers/expandDecimals'

export default function convertPriceToUsd(
  tokenAmount: bigint,
  tokenDecimals: number,
  price: bigint,
) {
  return (tokenAmount * price) / expandDecimals(1n, tokenDecimals)
}
