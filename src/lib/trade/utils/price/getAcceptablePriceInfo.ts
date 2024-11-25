import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import {BASIS_POINTS_DIVISOR_BIGINT} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import getCappedPositionImpactUsd from '@/lib/trade/utils/fee/getCappedPositionImpactUsd'
import shouldUseMaxPrice from '@/lib/trade/utils/price/shouldUseMaxPrice'
import roundUpMagnitudeDivision from '@/utils/numbers/bigint/roundUpMagnitudeDivision'
import expandDecimals from '@/utils/numbers/expandDecimals'

import convertUsdToTokenAmount from './convertUsdToTokenAmount'
import {getAcceptablePriceByPriceImpact} from './getAcceptablePriceByPriceImpact'
import getPriceImpactByAcceptablePrice from './getPriceImpactByAcceptablePrice'

export default function getAcceptablePriceInfo(p: {
  marketInfo: MarketData
  isIncrease: boolean
  isLong: boolean
  indexPrice: bigint
  sizeDeltaUsd: bigint
  maxNegativePriceImpactBps?: bigint
  tokenPricesData: TokenPricesData
}) {
  const {
    marketInfo,
    isIncrease,
    isLong,
    indexPrice,
    sizeDeltaUsd,
    maxNegativePriceImpactBps,
    tokenPricesData,
  } = p
  const {indexToken} = marketInfo

  const values = {
    acceptablePrice: 0n,
    acceptablePriceDeltaBps: 0n,
    priceImpactDeltaAmount: 0n,
    priceImpactDeltaUsd: 0n,
    priceImpactDiffUsd: 0n,
  }

  if (sizeDeltaUsd <= 0 || indexPrice == 0n) {
    return values
  }

  const shouldFlipPriceImpact = shouldUseMaxPrice(p.isIncrease, p.isLong)

  // For Limit / Trigger orders
  if (maxNegativePriceImpactBps !== undefined && maxNegativePriceImpactBps > 0) {
    let priceDelta = (indexPrice * maxNegativePriceImpactBps) / BASIS_POINTS_DIVISOR_BIGINT

    priceDelta = shouldFlipPriceImpact ? priceDelta * -1n : priceDelta

    values.acceptablePrice = indexPrice - priceDelta
    values.acceptablePriceDeltaBps = maxNegativePriceImpactBps * -1n

    const priceImpact = getPriceImpactByAcceptablePrice({
      sizeDeltaUsd,
      acceptablePrice: values.acceptablePrice,
      indexPrice,
      isLong,
      isIncrease,
    })

    values.priceImpactDeltaUsd = priceImpact.priceImpactDeltaUsd
    values.priceImpactDeltaAmount = priceImpact.priceImpactDeltaAmount

    return values
  }

  values.priceImpactDeltaUsd = getCappedPositionImpactUsd(
    marketInfo,
    isIncrease ? sizeDeltaUsd : sizeDeltaUsd * -1n,
    isLong,
    tokenPricesData,
    {
      fallbackToZero: !isIncrease,
    },
  )

  if (!isIncrease && values.priceImpactDeltaUsd < 0) {
    const minPriceImpactUsd =
      applyFactor(sizeDeltaUsd, marketInfo.maxPositionImpactFactorNegative) * -1n

    if (values.priceImpactDeltaUsd < minPriceImpactUsd) {
      values.priceImpactDiffUsd = minPriceImpactUsd - values.priceImpactDeltaUsd
      values.priceImpactDeltaUsd = minPriceImpactUsd
    }
  }

  const indexTokenPrice = tokenPricesData.get(indexToken.address)

  if (values.priceImpactDeltaUsd > 0) {
    values.priceImpactDeltaAmount = convertUsdToTokenAmount(
      values.priceImpactDeltaUsd,
      indexToken.decimals,
      indexTokenPrice?.max ?? 0n,
    )
  } else {
    values.priceImpactDeltaAmount = roundUpMagnitudeDivision(
      values.priceImpactDeltaUsd * expandDecimals(1, indexToken.decimals),
      indexTokenPrice?.min ?? 0n,
    )
  }

  const acceptablePriceValues = getAcceptablePriceByPriceImpact({
    isIncrease,
    isLong,
    indexPrice,
    sizeDeltaUsd,
    priceImpactDeltaUsd: values.priceImpactDeltaUsd,
  })

  values.acceptablePrice = acceptablePriceValues.acceptablePrice
  values.acceptablePriceDeltaBps = acceptablePriceValues.acceptablePriceDeltaBps

  return values
}
