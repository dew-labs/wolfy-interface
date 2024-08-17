import {
  createSatoruContract,
  isRepresentZero,
  ReferralStorageABI,
  SatoruContract,
  STARKNET_HEX_STRING_ZERO,
  StarknetChainId,
} from 'satoru-sdk'

const REFERRAL_CODE_KEY = 'referralCode'

import {decodeReferralCode} from '@/lib/trade/utils/referral/decodeReferralCode'
import simpleStorage from '@/utils/simpleStorage'

import fetchReferralCodeOwner from './fetchReferralCodeOwner'

export default async function fetchUserReferralCode(
  chainId: StarknetChainId,
  account: string | undefined,
  skipLocalReferralCode = false,
) {
  const localStorageCode = String(simpleStorage.get(REFERRAL_CODE_KEY))

  const referralStorageContract = createSatoruContract(
    chainId,
    SatoruContract.ReferralStorage,
    ReferralStorageABI,
  )
  const onChainCode =
    account && String(await referralStorageContract.trader_referral_codes(account))

  const localStorageCodeOwner = await fetchReferralCodeOwner(chainId, localStorageCode)

  let attachedOnChain = false
  let userReferralCode: string | undefined = undefined
  let userReferralCodeString: string | undefined = undefined
  let referralCodeForTxn = STARKNET_HEX_STRING_ZERO

  if (skipLocalReferralCode || (onChainCode && !isRepresentZero(onChainCode))) {
    attachedOnChain = true
    userReferralCode = onChainCode
    userReferralCodeString = decodeReferralCode(onChainCode)
  } else if (localStorageCodeOwner && !isRepresentZero(localStorageCodeOwner)) {
    attachedOnChain = false
    userReferralCode = localStorageCode
    userReferralCodeString = decodeReferralCode(localStorageCode)
    referralCodeForTxn = localStorageCode
  }

  return {
    attachedOnChain,
    userReferralCode,
    userReferralCodeString,
    referralCodeForTxn,
  }
}
