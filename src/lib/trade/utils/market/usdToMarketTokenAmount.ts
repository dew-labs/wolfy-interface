import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import expandDecimals from '@/utils/numbers/expandDecimals'

export default function usdToMarketTokenAmount(
  marketInfo: MarketData,
  marketToken: MarketTokenData,
  usdValue: bigint,
) {
  const supply = marketToken.totalSupply
  const poolValue = marketInfo.poolValueMax
  // if the supply and poolValue is zero, use 1 USD as the token price
  if (supply === 0n && poolValue === 0n) {
    return convertUsdToTokenAmount(usdValue, marketToken.decimals, expandDecimals(1, USD_DECIMALS))
  }

  // if the supply is zero and the poolValue is more than zero,
  // then include the poolValue for the amount of tokens minted so that
  // the market token price after mint would be 1 USD
  if (supply === 0n && poolValue > 0) {
    return convertUsdToTokenAmount(
      usdValue + poolValue,
      marketToken.decimals,
      expandDecimals(1, USD_DECIMALS),
    )
  }

  if (poolValue === 0n) {
    return 0n
  }

  return (supply * usdValue) / poolValue
}
