import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import expandDecimals from '@/utils/numbers/expandDecimals'

export function marketTokenAmountToUsd(
  marketInfo: MarketData,
  marketToken: MarketTokenData,
  amount: bigint,
) {
  const supply = marketToken.totalSupply
  const poolValue = marketInfo.poolValueMax

  const price =
    supply === 0n
      ? expandDecimals(1, USD_DECIMALS)
      : (poolValue * expandDecimals(1, marketToken.decimals)) / supply

  return convertTokenAmountToUsd(amount, marketToken.decimals, price)
}
