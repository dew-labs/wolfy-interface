import type {StarknetChainId} from 'wolfy-sdk'

import {basisPointsToFloat} from '@/lib/trade/numbers/basisPointsToFloat'

import fetchAffiliateTier from './fetchAffiliateTier'
import fetchReferralCodeOwner from './fetchReferralCodeOwner'
import fetchReferrerDiscountShare from './fetchReferrerDiscountShare'
import fetchTiers from './fetchTiers'
import fetchUserReferralCode from './fetchUserReferralCode'

export interface ReferralInfo {
  userReferralCode: string
  userReferralCodeString: string
  referralCodeForTxn: string
  attachedOnChain: boolean
  affiliate: string
  tierId: bigint
  totalRebate: bigint
  totalRebateFactor: bigint
  discountShare: bigint
  discountFactor: bigint
}

export default async function fetchReferralInfo(
  chainId: StarknetChainId,
  account: string | undefined,
  skipLocalReferralCode = false,
): Promise<ReferralInfo | null> {
  const {userReferralCode, userReferralCodeString, attachedOnChain, referralCodeForTxn} =
    await fetchUserReferralCode(chainId, account, skipLocalReferralCode)

  const codeOwner = await fetchReferralCodeOwner(chainId, userReferralCode)
  const affiliateTier = await fetchAffiliateTier(chainId, account)
  const {totalRebate, discountShare} = await fetchTiers(chainId, affiliateTier)
  const customDiscountShare = await fetchReferrerDiscountShare(chainId, codeOwner)

  const finalDiscountShare = customDiscountShare > 0 ? customDiscountShare : discountShare

  if (
    !userReferralCode ||
    !userReferralCodeString ||
    !codeOwner ||
    affiliateTier === undefined ||
    !referralCodeForTxn
  ) {
    return null
  }

  return {
    userReferralCode,
    userReferralCodeString,
    referralCodeForTxn,
    attachedOnChain,
    affiliate: codeOwner,
    tierId: affiliateTier,
    totalRebate,
    totalRebateFactor: basisPointsToFloat(totalRebate),
    discountShare: finalDiscountShare,
    discountFactor: basisPointsToFloat(finalDiscountShare),
  }
}
