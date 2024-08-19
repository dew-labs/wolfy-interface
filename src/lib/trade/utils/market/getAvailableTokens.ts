import type {MarketData, MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenData} from '@/lib/trade/services/fetchTokensData'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export interface AvailableTokens {
  allMarkets: Set<MarketData>
  swapTokens: Set<TokenData>
  indexTokens: Set<TokenData>
  longLiquid: Map<string, bigint>
  shortLiquid: Map<string, bigint>
}

export default function getAvailableTokens(markets: MarketsData): AvailableTokens {
  const indexTokens = new Set<TokenData>()
  const collaterals = new Set<TokenData>()
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

    const longToken = market.longToken
    const shortToken = market.shortToken
    const indexToken = market.indexToken

    collaterals.add(longToken)
    collaterals.add(shortToken)

    const longPoolAmountUsd = convertTokenAmountToUsd(
      market.longPoolAmount,
      market.longToken.decimals,
      getMidPrice(market.longToken.price),
    )

    const shortPoolAmountUsd = convertTokenAmountToUsd(
      market.shortPoolAmount,
      market.shortToken.decimals,
      getMidPrice(market.shortToken.price),
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
    indexTokens: indexTokens,
    longLiquid: longTokensWithPoolValue,
    shortLiquid: shortTokensWithPoolValue,
  }
}
