import {type StarknetChainId} from 'wolfy-sdk'

import {type Market} from '@/lib/trade/services/fetchMarkets'

import {fetchMarketData, type MarketData} from './fetchMarketData'
import type {TokenPricesData} from './fetchTokenPrices'

export type MarketsData = Map<string, MarketData>

export default async function fetchMarketsData(
  chainId: StarknetChainId,
  markets: Market[],
  tokenPriceData: TokenPricesData,
): Promise<MarketsData> {
  const results = await Promise.allSettled(
    markets.map(async market => {
      return fetchMarketData(chainId, market, tokenPriceData)
    }),
  )

  const marketMap = new Map<string, MarketData>()

  results.forEach(result => {
    if (result.status !== 'fulfilled') return
    marketMap.set(result.value.marketTokenAddress, result.value)
  })

  return marketMap
}
