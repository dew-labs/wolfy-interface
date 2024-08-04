import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import convertPriceToUsd from './price/convertPriceToUsd'

export function getReservedUsd(marketInfo: MarketData, isLong: boolean) {
  const {indexToken} = marketInfo

  if (isLong) {
    return convertPriceToUsd(
      marketInfo.longInterestInTokens,
      marketInfo.indexToken.decimals,
      indexToken.price.max,
    )
  } else {
    return marketInfo.shortInterestUsd
  }
}
