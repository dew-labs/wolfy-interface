import type {MarketData} from '@/lib/trade/services/fetchMarketData'

export function getOpenInterestUsd(marketInfo: MarketData, isLong: boolean) {
  return isLong ? marketInfo.longInterestUsd : marketInfo.shortInterestUsd
}
