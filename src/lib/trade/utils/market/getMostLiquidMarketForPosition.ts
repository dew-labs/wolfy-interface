import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'

import {getAvailableUsdLiquidityForPosition} from './getAvailableUsdLiquidityForPosition'
import isMarketCollateral from './isMarketCollateral'
import isMarketIndexToken from './isMarketIndexToken'

export default function getMostLiquidMarketForPosition(
  marketsInfo: MarketData[],
  tokenPricesData: TokenPricesData,
  indexTokenAddress: string,
  collateralTokenAddress: string | undefined,
  isLong: boolean,
) {
  let bestMarket: MarketData | undefined
  let bestLiquidity: bigint | undefined

  for (const marketInfo of marketsInfo) {
    if (marketInfo.isSpotOnly) {
      continue
    }

    let isCandidate = isMarketIndexToken(marketInfo, indexTokenAddress)

    if (collateralTokenAddress) {
      isCandidate = isMarketCollateral(marketInfo, collateralTokenAddress)
    }

    if (isCandidate) {
      const liquidity = getAvailableUsdLiquidityForPosition(marketInfo, tokenPricesData, isLong)

      if (liquidity && liquidity > (bestLiquidity ?? 0)) {
        bestMarket = marketInfo
        bestLiquidity = liquidity
      }
    }
  }

  return bestMarket
}
