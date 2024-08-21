import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import {getTokenPoolType} from './getTokenPoolType'

export default function isMarketCollateral(marketInfo: MarketData, tokenAddress: string) {
  return getTokenPoolType(marketInfo, tokenAddress) !== undefined
}
