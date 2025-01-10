import type {MarketData} from '@/lib/trade/services/fetchMarketData'

/**
 * Apart from usual cases, returns `long` for single token backed markets.
 */
export function getTokenPoolType(
  marketInfo: MarketData,
  tokenAddress: string,
): 'long' | 'short' | undefined {
  const {longToken, shortToken} = marketInfo

  if (longToken.address === shortToken.address && tokenAddress === longToken.address) {
    return 'long'
  }

  if (tokenAddress === longToken.address) {
    return 'long'
  }

  if (tokenAddress === shortToken.address) {
    return 'short'
  }

  return undefined
}
