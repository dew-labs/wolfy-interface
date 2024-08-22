import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'

export function getReservedUsd(
  marketInfo: MarketData,
  tokenPricesData: TokenPricesData,
  isLong: boolean,
) {
  if (isLong) {
    const {indexToken} = marketInfo
    const indexTokenPrice = tokenPricesData.get(indexToken.address)

    if (!indexTokenPrice) throw new Error(`Index token price not found for ${indexToken.address}`)

    return convertTokenAmountToUsd(
      marketInfo.longInterestInTokens,
      marketInfo.indexToken.decimals,
      indexTokenPrice.max,
    )
  } else {
    return marketInfo.shortInterestUsd
  }
}
