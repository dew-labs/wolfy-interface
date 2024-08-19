import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

export default function isMarketIndexToken(marketData: MarketData, tokenAddress: string) {
  return tokenAddress === marketData.indexToken.address
}
