import {DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER} from '@/constants/config'
import abs from '@/utils/numbers/bigint/abs'

import {getAcceptablePriceByPriceImpact} from './getAcceptablePriceByPriceImpact'

export default function getDefaultAcceptablePriceImpactBps(p: {
  isIncrease: boolean
  isLong: boolean
  indexPrice: bigint
  sizeDeltaUsd: bigint
  priceImpactDeltaUsd: bigint
  acceptablePriceImpactBuffer?: number | undefined
}) {
  const {
    indexPrice,
    sizeDeltaUsd,
    priceImpactDeltaUsd,
    acceptablePriceImpactBuffer = DEFAULT_ACCEPTABLE_PRICE_IMPACT_BUFFER,
  } = p

  if (priceImpactDeltaUsd > 0) {
    return BigInt(acceptablePriceImpactBuffer)
  }

  const baseAcceptablePriceValues = getAcceptablePriceByPriceImpact({
    isIncrease: p.isIncrease,
    isLong: p.isLong,
    indexPrice,
    sizeDeltaUsd,
    priceImpactDeltaUsd,
  })

  if (baseAcceptablePriceValues.acceptablePriceDeltaBps < 0) {
    return (
      abs(baseAcceptablePriceValues.acceptablePriceDeltaBps) + BigInt(acceptablePriceImpactBuffer)
    )
  }

  return BigInt(acceptablePriceImpactBuffer)
}
