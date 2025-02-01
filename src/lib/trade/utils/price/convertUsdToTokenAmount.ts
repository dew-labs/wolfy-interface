import expandDecimals from '@/utils/numbers/expandDecimals'

export default function convertUsdToTokenAmount(
  usd: bigint,
  tokenDecimals: number | bigint,
  price: bigint,
) {
  return (usd * expandDecimals(1, tokenDecimals)) / price
}
