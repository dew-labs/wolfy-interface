import expandDecimals from '@/utils/numbers/expandDecimals'

export default function parseContractPrice(price: bigint, tokenDecimals: number) {
  return price * expandDecimals(1, tokenDecimals)
}
