import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'

import shouldUseMaxPrice from './shouldUseMaxPrice'

export function getAcceptablePriceByPriceImpact(p: {
  isIncrease: boolean
  isLong: boolean
  indexPrice: bigint
  sizeDeltaUsd: bigint
  priceImpactDeltaUsd: bigint
}) {
  const {indexPrice, sizeDeltaUsd, priceImpactDeltaUsd} = p

  if (sizeDeltaUsd <= 0 || indexPrice === 0n) {
    return {acceptablePrice: indexPrice, acceptablePriceDeltaBps: 0n, priceDelta: 0n}
  }

  const shouldFlipPriceImpact = shouldUseMaxPrice(p.isIncrease, p.isLong)

  const priceImpactForPriceAdjustment = shouldFlipPriceImpact
    ? priceImpactDeltaUsd * -1n
    : priceImpactDeltaUsd
  const acceptablePrice =
    (indexPrice * (sizeDeltaUsd + priceImpactForPriceAdjustment)) / sizeDeltaUsd

  const priceDelta = (indexPrice - acceptablePrice) * (shouldFlipPriceImpact ? 1n : -1n)
  const acceptablePriceDeltaBps = getBasisPoints(priceDelta, p.indexPrice)

  return {acceptablePrice, acceptablePriceDeltaBps, priceDelta}
}
