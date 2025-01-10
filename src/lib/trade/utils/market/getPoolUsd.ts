import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export default function getPoolUsd(
  marketInfo: MarketData,
  isLong: boolean,
  priceType: 'minPrice' | 'maxPrice' | 'midPrice',
  longTokenPrice: Price,
  shortTokenPrice: Price,
) {
  const poolAmount = isLong ? marketInfo.longPoolAmount : marketInfo.shortPoolAmount
  const token = isLong ? marketInfo.longToken : marketInfo.shortToken
  const tokenPrice = isLong ? longTokenPrice : shortTokenPrice

  let price: bigint

  if (priceType === 'minPrice') {
    price = tokenPrice.min
  } else if (priceType === 'maxPrice') {
    price = tokenPrice.max
  } else {
    price = getMidPrice(tokenPrice)
  }

  return convertTokenAmountToUsd(poolAmount, token.decimals, price)
}
