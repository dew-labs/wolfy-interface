import type {StarknetChainId} from 'satoru-sdk'
import {
  cairoIntToBigInt,
  createSatoruContract,
  ReferralStorageABI,
  SatoruContract,
} from 'satoru-sdk'

export default async function fetchReferrerDiscountShare(
  chainId: StarknetChainId,
  owner: string | undefined,
) {
  if (!owner) return 0n

  const referralStorageContract = createSatoruContract(
    chainId,
    SatoruContract.ReferralStorage,
    ReferralStorageABI,
  )
  return cairoIntToBigInt(await referralStorageContract.referrer_discount_shares(owner))
}
