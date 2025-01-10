import type {MarketData} from '@/lib/trade/services/fetchMarketData'

import {getTokenPoolType} from './getTokenPoolType'

export function getOppositeCollateral(marketInfo: MarketData, tokenAddress: string) {
  const poolType = getTokenPoolType(marketInfo, tokenAddress)

  if (poolType === 'long') {
    return marketInfo.shortToken
  }

  if (poolType === 'short') {
    return marketInfo.longToken
  }

  return undefined
}
