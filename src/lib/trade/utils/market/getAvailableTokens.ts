import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export interface AvailableTokens {
  allMarkets: Set<MarketData>
  swapTokens: Set<Token>
  indexTokens: Set<Token>
  longLiquid: Map<string, bigint>
  shortLiquid: Map<string, bigint>
}

export default function getAvailableTokens(
  markets: MarketsData,
  tokenPrices: TokenPricesData,
): AvailableTokens {
  const indexTokens = new Set<Token>()
  const collaterals = new Set<Token>()
  const allMarkets = new Set<MarketData>()

  // Total long pool of a token
  const longTokensWithPoolValue = new Map<string, bigint>()
  // Total short pool of a token
  const shortTokensWithPoolValue = new Map<string, bigint>()
  // const indexTokensWithPoolValue = new Map<string, bigint>()

  markets.forEach(market => {
    if (market.isDisabled) {
      return
    }

    const longTokenPrice = tokenPrices.get(market.longToken.address)
    const shortTokenPrice = tokenPrices.get(market.shortToken.address)

    if (!longTokenPrice || !shortTokenPrice) return

    const longToken = market.longToken
    const shortToken = market.shortToken
    const indexToken = market.indexToken

    collaterals.add(longToken)
    collaterals.add(shortToken)

    const longPoolAmountUsd = convertTokenAmountToUsd(
      market.longPoolAmount,
      market.longToken.decimals,
      getMidPrice(longTokenPrice),
    )

    const shortPoolAmountUsd = convertTokenAmountToUsd(
      market.shortPoolAmount,
      market.shortToken.decimals,
      getMidPrice(shortTokenPrice),
    )

    const currentLongTokenPoolValue = longTokensWithPoolValue.get(longToken.address) ?? 0n
    const currentShortTokenPoolValue = shortTokensWithPoolValue.get(shortToken.address) ?? 0n

    longTokensWithPoolValue.set(longToken.address, currentLongTokenPoolValue + longPoolAmountUsd)
    shortTokensWithPoolValue.set(
      shortToken.address,
      currentShortTokenPoolValue + shortPoolAmountUsd,
    )

    if (!market.isSpotOnly) {
      indexTokens.add(indexToken)
      allMarkets.add(market)

      // const currentIndexTokenPoolValue = indexTokensWithPoolValue.get(indexToken.address) ?? 0n

      // indexTokensWithPoolValue.set(
      //   indexToken.address,
      //   currentIndexTokenPoolValue + market.poolValueMax,
      // )
    }
  })

  return {
    allMarkets,
    swapTokens: collaterals,
    indexTokens,
    longLiquid: longTokensWithPoolValue,
    shortLiquid: shortTokensWithPoolValue,
  }
}
