import {
  createWolfyContract,
  ReferralStorageABI,
  type StarknetChainId,
  toStarknetHexString,
  WolfyContract,
} from 'wolfy-sdk'

export default async function fetchReferralCodeOwner(
  chainId: StarknetChainId,
  referralCode: string | undefined,
) {
  if (!referralCode) {
    return undefined
  }
  const referralStorageContract = createWolfyContract(
    chainId,
    WolfyContract.ReferralStorage,
    ReferralStorageABI,
  )
  return toStarknetHexString(await referralStorageContract.code_owners(referralCode))
}
