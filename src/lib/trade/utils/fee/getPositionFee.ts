import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

export function getPositionFee(
  marketInfo: MarketData,
  sizeDeltaUsd: bigint,
  forPositiveImpact: boolean,
  referralInfo: {totalRebateFactor: bigint; discountFactor: bigint} | undefined | null,
  uiFeeFactor?: bigint,
) {
  const factor = forPositiveImpact
    ? marketInfo.positionFeeFactorForPositiveImpact
    : marketInfo.positionFeeFactorForNegativeImpact

  let positionFeeUsd = applyFactor(sizeDeltaUsd, factor)
  const uiFeeUsd = applyFactor(sizeDeltaUsd, uiFeeFactor ?? 0n)

  if (!referralInfo) {
    return {positionFeeUsd, discountUsd: 0n, totalRebateUsd: 0n}
  }

  const totalRebateUsd = applyFactor(positionFeeUsd, referralInfo.totalRebateFactor)
  const discountUsd = applyFactor(totalRebateUsd, referralInfo.discountFactor)

  positionFeeUsd = positionFeeUsd - discountUsd

  return {
    positionFeeUsd,
    discountUsd,
    totalRebateUsd,
    uiFeeUsd,
  }
}
