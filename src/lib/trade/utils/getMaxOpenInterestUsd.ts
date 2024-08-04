import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

export function getMaxOpenInterestUsd(marketInfo: MarketData, isLong: boolean) {
  return isLong ? marketInfo.maxOpenInterestLong : marketInfo.maxOpenInterestShort
}
