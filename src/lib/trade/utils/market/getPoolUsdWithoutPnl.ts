import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export function getPoolUsdWithoutPnl(
  marketInfo: MarketData,
  isLong: boolean,
  priceType: 'min' | 'max' | 'mid' = 'mid',
) {
  const poolAmount = isLong ? marketInfo.longPoolAmount : marketInfo.shortPoolAmount
  const token = isLong ? marketInfo.longToken : marketInfo.shortToken

  let price: bigint

  if (priceType === 'min') {
    price = token.price.min
  } else if (priceType === 'max') {
    price = token.price.max
  } else {
    price = getMidPrice(token.price)
  }

  return convertTokenAmountToUsd(poolAmount, token.decimals, price)
}
