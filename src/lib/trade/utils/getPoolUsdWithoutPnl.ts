import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import convertPriceToUsd from './price/convertPriceToUsd'
import getMidPrice from './price/getMidPrice'

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

  return convertPriceToUsd(poolAmount, token.decimals, price)
}
