import {
  cairoIntToBigInt,
  createSatoruContract,
  ReferralStorageABI,
  SatoruContract,
  type StarknetChainId,
} from 'satoru-sdk'

export default async function fetchAffiliateTier(
  chainId: StarknetChainId,
  account: string | undefined,
) {
  if (!account) {
    return undefined
  }

  const referralStorageContract = createSatoruContract(
    chainId,
    SatoruContract.ReferralStorage,
    ReferralStorageABI,
  )
  return cairoIntToBigInt(await referralStorageContract.referrer_tiers(account))
}
