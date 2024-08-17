import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import {getCappedPoolPnl} from '@/lib/trade/utils/market/getCappedPoolPnl'
import {getPoolUsdWithoutPnl} from '@/lib/trade/utils/market/getPoolUsdWithoutPnl'
import convertPriceToUsd from '@/lib/trade/utils/price/convertPriceToUsd'
import expandDecimals from '@/utils/numbers/expandDecimals'

export function getPositionValueUsd(p: {
  indexToken: Token
  sizeInTokens: bigint
  markPrice: bigint
}) {
  const {indexToken, sizeInTokens, markPrice} = p

  return convertPriceToUsd(sizeInTokens, indexToken.decimals, markPrice)
}

export default function getPositionPnlUsd(p: {
  marketInfo: MarketData
  sizeInUsd: bigint
  sizeInTokens: bigint
  markPrice: bigint
  isLong: boolean
}) {
  const {marketInfo, sizeInUsd, sizeInTokens, markPrice, isLong} = p

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
  const poolUsd = getPoolUsdWithoutPnl(marketInfo, isLong, 'min')

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
