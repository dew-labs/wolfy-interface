import type {StarknetChainId} from 'wolfy-sdk'
import {cairoIntToBigInt, createWolfyContract, ReferralStorageABI, WolfyContract} from 'wolfy-sdk'

export default async function fetchReferrerDiscountShare(
  chainId: StarknetChainId,
  owner: string | undefined,
) {
  if (!owner) return 0n

  const referralStorageContract = createWolfyContract(
    chainId,
    WolfyContract.ReferralStorage,
    ReferralStorageABI,
  )
  return cairoIntToBigInt(await referralStorageContract.referrer_discount_shares(owner))
}
