import {
  createSatoruContract,
  ReferralStorageABI,
  SatoruContract,
  type StarknetChainId,
  toStarknetHexString,
} from 'satoru-sdk'

export default async function fetchReferralCodeOwner(
  chainId: StarknetChainId,
  referralCode: string | undefined,
) {
  if (!referralCode) {
    return undefined
  }
  const referralStorageContract = createSatoruContract(
    chainId,
    SatoruContract.ReferralStorage,
    ReferralStorageABI,
  )
  return toStarknetHexString(await referralStorageContract.code_owners(referralCode))
}
