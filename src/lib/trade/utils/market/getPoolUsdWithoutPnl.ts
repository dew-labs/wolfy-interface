import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export function getPoolUsdWithoutPnl(
  marketInfo: MarketData,
  tokenPrices: TokenPricesData,
  isLong: boolean,
  priceType: 'min' | 'max' | 'mid' = 'mid',
) {
  const poolAmount = isLong ? marketInfo.longPoolAmount : marketInfo.shortPoolAmount
  const token = isLong ? marketInfo.longToken : marketInfo.shortToken

  const tokenPrice = tokenPrices.get(token.address)

  if (!tokenPrice) throw new Error(`Token price not found for ${token.symbol}`)

  let price: bigint

  if (priceType === 'min') {
    price = tokenPrice.min
  } else if (priceType === 'max') {
    price = tokenPrice.max
  } else {
    price = getMidPrice(tokenPrice)
  }

  return convertTokenAmountToUsd(poolAmount, token.decimals, price)
}
