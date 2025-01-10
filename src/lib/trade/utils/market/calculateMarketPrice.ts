import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import expandDecimals from '@/utils/numbers/expandDecimals'

const ONE_USD = expandDecimals(1, USD_DECIMALS)

const DEFAULT_PRICE = {
  min: ONE_USD,
  max: ONE_USD,
}

export default function calculateMarketPrice(
  market?: MarketData,
  marketTokenData?: MarketTokenData,
  longTokenPrice?: Price,
  shortTokenPrice?: Price,
): Price {
  const totalSupply = marketTokenData?.totalSupply ?? 0n

  if (!market || !marketTokenData || !longTokenPrice || !shortTokenPrice || totalSupply <= 0n)
    return DEFAULT_PRICE

  // Max price

  const longTokenValueMax = convertTokenAmountToUsd(
    market.longPoolAmount,
    market.longToken.decimals,
    longTokenPrice.max,
  )
  const shortTokenValueMax = convertTokenAmountToUsd(
    market.shortPoolAmount,
    market.shortToken.decimals,
    shortTokenPrice.max,
  )

  // TODO: check why netPnlMax is not right
  const pendingPnlMax = market.netPnlMax

  const totalValueMax = longTokenValueMax + shortTokenValueMax - pendingPnlMax

  // Min price

  const longTokenValueMin = convertTokenAmountToUsd(
    market.longPoolAmount,
    market.longToken.decimals,
    longTokenPrice.min,
  )
  const shortTokenValueMin = convertTokenAmountToUsd(
    market.shortPoolAmount,
    market.shortToken.decimals,
    shortTokenPrice.min,
  )

  // TODO: check why netPnlMin is not right
  const pendingPnlMin = market.netPnlMin

  const totalValueMin = longTokenValueMin + shortTokenValueMin - pendingPnlMin

  // Calculation

  return {
    min: expandDecimals(totalValueMin, marketTokenData.decimals) / totalSupply,
    max: expandDecimals(totalValueMax, marketTokenData.decimals) / totalSupply,
  }
}
