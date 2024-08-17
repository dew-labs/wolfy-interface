import {
  cairoIntToBigInt,
  createSatoruContract,
  ReferralStorageABI,
  SatoruContract,
  StarknetChainId,
} from 'satoru-sdk'

export default async function fetchTiers(chainId: StarknetChainId, tierLevel: bigint | undefined) {
  if (!tierLevel) {
    return {
      totalRebate: 0n,
      discountShare: 0n,
    }
  }

  const referralStorageContract = createSatoruContract(
    chainId,
    SatoruContract.ReferralStorage,
    ReferralStorageABI,
  )
  const {discount_share, total_rebate} = await referralStorageContract.tiers(tierLevel)

  return {
    totalRebate: cairoIntToBigInt(total_rebate),
    discountShare: cairoIntToBigInt(discount_share),
  }
}
