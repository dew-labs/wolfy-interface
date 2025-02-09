import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'

export default function getPriceImpactByAcceptablePrice(p: {
  sizeDeltaUsd: bigint
  acceptablePrice: bigint
  indexPrice: bigint
  isLong: boolean
  isIncrease: boolean
}) {
  const {sizeDeltaUsd, acceptablePrice, indexPrice: markPrice, isLong, isIncrease} = p

  const shouldFlipPriceDiff = isIncrease ? !isLong : isLong

  const priceDelta = (markPrice - acceptablePrice) * (shouldFlipPriceDiff ? -1n : 1n)
  const acceptablePriceDeltaBps = markPrice === 0n ? 0n : getBasisPoints(priceDelta, markPrice)

  const priceImpactDeltaUsd =
    acceptablePrice === 0n ? 0n : (sizeDeltaUsd * priceDelta) / acceptablePrice

  const priceImpactDeltaAmount = markPrice === 0n ? 0n : priceImpactDeltaUsd / markPrice

  return {priceImpactDeltaUsd, priceImpactDeltaAmount, priceDelta, acceptablePriceDeltaBps}
}
