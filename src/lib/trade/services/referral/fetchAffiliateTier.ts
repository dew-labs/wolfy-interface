import {
  cairoIntToBigInt,
  createWolfyContract,
  ReferralStorageABI,
  type StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

export default async function fetchAffiliateTier(
  chainId: StarknetChainId,
  account: string | undefined,
) {
  if (!account) {
    return undefined
  }

  const referralStorageContract = createWolfyContract(
    chainId,
    WolfyContract.ReferralStorage,
    ReferralStorageABI,
  )
  return cairoIntToBigInt(await referralStorageContract.referrer_tiers(account))
}
