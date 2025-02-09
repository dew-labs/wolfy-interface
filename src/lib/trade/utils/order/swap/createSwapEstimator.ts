import invariant from 'tiny-invariant'

import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'

import getSwapStats from './getSwapStats'
import type {MarketEdge, SwapEstimator} from './types'

export default function createSwapEstimator(
  marketsData: MarketsData,
  tokenPricesData: TokenPricesData,
): SwapEstimator {
  return (e: MarketEdge, usdIn: bigint) => {
    const marketInfo = marketsData.get(e.marketAddress)

    invariant(marketInfo, 'Market info not found')

    const swapStats = getSwapStats({
      marketInfo,
      tokenPricesData,
      usdIn,
      tokenInAddress: e.from,
      tokenOutAddress: e.to,
      shouldApplyPriceImpact: true,
    })

    const isOutLiquidity = swapStats.isOutLiquidity
    const usdOut = swapStats.usdOut

    if (isOutLiquidity) {
      return {usdOut: 0n}
    }

    return {usdOut}
  }
}
