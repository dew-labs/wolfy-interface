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
  // TODO: the calculation is heavy, should split to multiple requests and use together with useQueries to have fine-grain retry for each market instead of all at once
  const results = await Promise.all(
    markets.map(async market => {
      return await fetchMarketData(chainId, market, tokenPriceData)
    }),
  )

  const marketMap = new Map<string, MarketData>()

  results.forEach(result => {
    marketMap.set(result.marketTokenAddress, result)
  })

  return marketMap
}
