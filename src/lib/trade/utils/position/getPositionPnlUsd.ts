import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {getCappedPoolPnl} from '@/lib/trade/utils/market/getCappedPoolPnl'
import {getPoolUsdWithoutPnl} from '@/lib/trade/utils/market/getPoolUsdWithoutPnl'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import expandDecimals from '@/utils/numbers/expandDecimals'

export function getPositionValueUsd(p: {
  indexToken: Token
  sizeInTokens: bigint
  markPrice: bigint
}) {
  const {indexToken, sizeInTokens, markPrice} = p

  return convertTokenAmountToUsd(sizeInTokens, indexToken.decimals, markPrice)
}

export default function getPositionPnlUsd(p: {
  marketInfo: MarketData
  tokenPricesData: TokenPricesData
  sizeInUsd: bigint
  sizeInTokens: bigint
  markPrice: bigint
  isLong: boolean
}) {
  const {marketInfo, sizeInUsd, sizeInTokens, markPrice, isLong, tokenPricesData} = p

  const positionValueUsd = getPositionValueUsd({
    indexToken: marketInfo.indexToken,
    sizeInTokens,
    markPrice,
  })

  let totalPnl = isLong ? positionValueUsd - sizeInUsd : sizeInUsd - positionValueUsd

  if (totalPnl <= 0) {
    return totalPnl
  }

  const poolPnl = isLong ? p.marketInfo.pnlLongMax : p.marketInfo.pnlShortMax
  const poolUsd = getPoolUsdWithoutPnl(marketInfo, tokenPricesData, isLong, 'min')

  const cappedPnl = getCappedPoolPnl({
    marketInfo,
    poolUsd,
    isLong,
    maximize: true,
  })

  const WEI_PRECISION = expandDecimals(1, 18)

  if (cappedPnl !== poolPnl && cappedPnl > 0 && poolPnl > 0) {
    totalPnl = (totalPnl * (cappedPnl / WEI_PRECISION)) / (poolPnl / WEI_PRECISION)
  }

  return totalPnl
}
