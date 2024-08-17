import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import getAvailableUsdLiquidityForCollateral from '@/lib/trade/utils/market/getAvailableUsdLiquidityForCollateral'
import {getOppositeCollateral} from '@/lib/trade/utils/market/getOppositeCollateral'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'

export default function getMaxSwapPathLiquidity(p: {
  marketsData: MarketsData
  swapPath: string[]
  initialCollateralAddress: string
}) {
  const {marketsData: marketsInfoData, swapPath, initialCollateralAddress} = p

  if (swapPath.length === 0) {
    return 0n
  }

  let minMarketLiquidity
  let tokenInAddress = initialCollateralAddress

  for (const marketAddress of swapPath) {
    const marketInfo = marketsInfoData.get(marketAddress)

    if (!marketInfo) {
      return 0n
    }

    const tokenOut = getOppositeCollateral(marketInfo, tokenInAddress)

    if (!tokenOut) {
      return 0n
    }

    const isTokenOutLong = getTokenPoolType(marketInfo, tokenOut.address) === 'long'
    const liquidity = getAvailableUsdLiquidityForCollateral(marketInfo, isTokenOutLong)

    if (!minMarketLiquidity || liquidity < minMarketLiquidity) {
      minMarketLiquidity = liquidity
    }

    tokenInAddress = tokenOut.address
  }

  return minMarketLiquidity ?? 0n
}
