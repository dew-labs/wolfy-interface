import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'

export default function getSwapPathOutputAddresses(p: {
  marketsData: MarketsData
  initialCollateralAddress: string
  swapPath: string[]
  isIncrease: boolean
}) {
  const {marketsData: marketsInfoData, initialCollateralAddress, swapPath, isIncrease} = p

  if (swapPath.length === 0) {
    // Increase
    if (isIncrease) {
      // During increase target collateral token is always ERC20 token, it can not be native token.
      // Thus we do not need to check if initial collateral token is wrapped token to unwrap it.
      // So we can safely return initial collateral token address as out token address, when there is no swap path.

      return {
        outTokenAddress: initialCollateralAddress,
        outMarketAddress: undefined,
      }
    }

    return {
      outTokenAddress: initialCollateralAddress,
      outMarketAddress: undefined,
    }
  }

  const [firstMarketAddress, ...marketAddresses] = swapPath

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guaranteed to exist
  let outMarket = marketsInfoData.get(firstMarketAddress!)

  if (!outMarket) {
    return {
      outTokenAddress: undefined,
      outMarketAddress: undefined,
    }
  }

  let outTokenType = getTokenPoolType(outMarket, initialCollateralAddress)
  let outToken = outTokenType === 'long' ? outMarket.shortToken : outMarket.longToken

  for (const marketAddress of marketAddresses) {
    outMarket = marketsInfoData.get(marketAddress)

    if (!outMarket) {
      return {
        outTokenAddress: undefined,
        outMarketAddress: undefined,
      }
    }

    outTokenType = outMarket.longTokenAddress === outToken.address ? 'short' : 'long'
    outToken = outTokenType === 'long' ? outMarket.longToken : outMarket.shortToken
  }

  return {
    outTokenAddress: outToken.address,
    outMarketAddress: outMarket.marketTokenAddress,
  }
}
