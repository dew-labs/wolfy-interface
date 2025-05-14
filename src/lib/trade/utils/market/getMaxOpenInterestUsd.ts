import type {MarketData} from '@/lib/trade/services/fetchMarketData'

export function getMaxOpenInterestUsd(marketInfo: MarketData, isLong: boolean) {
  return isLong ? marketInfo.maxOpenInterestLong : marketInfo.maxOpenInterestShort
}
