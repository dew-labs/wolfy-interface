import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import {getAvailableUsdLiquidityForPosition} from './getAvailableUsdLiquidityForPosition'
import getCappedPositionImpactUsd from './getCappedPositionImpactUsd'
import isMarketIndexToken from './isMarketIndexToken'

export default function getMinPriceImpactMarket(
  marketDataList: MarketData[],
  indexTokenAddress: string,
  isLong: boolean,
  isIncrease: boolean,
  sizeDeltaUsd: bigint,
) {
  let bestMarket: MarketData | undefined
  // minimize negative impact
  let bestImpactDeltaUsd: bigint | undefined

  for (const marketInfo of marketDataList) {
    const liquidity = getAvailableUsdLiquidityForPosition(marketInfo, isLong)

    if (isMarketIndexToken(marketInfo, indexTokenAddress) && liquidity > sizeDeltaUsd) {
      const priceImpactDeltaUsd = getCappedPositionImpactUsd(marketInfo, sizeDeltaUsd, isLong)

      if (!bestImpactDeltaUsd || priceImpactDeltaUsd > bestImpactDeltaUsd) {
        bestMarket = marketInfo
        bestImpactDeltaUsd = priceImpactDeltaUsd
      }
    }
  }

  return {
    bestMarket,
    bestImpactDeltaUsd,
  }
}
