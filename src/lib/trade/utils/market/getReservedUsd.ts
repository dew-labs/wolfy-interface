import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'

export function getReservedUsd(marketInfo: MarketData, isLong: boolean) {
  const {indexToken} = marketInfo

  if (isLong) {
    return convertTokenAmountToUsd(
      marketInfo.longInterestInTokens,
      marketInfo.indexToken.decimals,
      indexToken.price.max,
    )
  } else {
    return marketInfo.shortInterestUsd
  }
}
