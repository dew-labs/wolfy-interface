import {
  cairoIntToBigInt,
  createWolfyContract,
  ReferralStorageABI,
  StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

export default async function fetchTiers(chainId: StarknetChainId, tierLevel: bigint | undefined) {
  if (!tierLevel) {
    return {totalRebate: 0n, discountShare: 0n}
  }

  const referralStorageContract = createWolfyContract(
    chainId,
    WolfyContract.ReferralStorage,
    ReferralStorageABI,
  )
  const {discount_share: discountShare, total_rebate: totalRebate} =
    await referralStorageContract.tiers(tierLevel)

  return {
    totalRebate: cairoIntToBigInt(totalRebate),
    discountShare: cairoIntToBigInt(discountShare),
  }
}
