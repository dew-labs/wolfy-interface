import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

export function getCappedPoolPnl(p: {
  marketInfo: MarketData
  poolUsd: bigint
  isLong: boolean
  maximize: boolean
}) {
  const {marketInfo, poolUsd, isLong, maximize} = p

  let poolPnl: bigint

  if (isLong) {
    poolPnl = maximize ? marketInfo.pnlLongMax : marketInfo.pnlLongMin
  } else {
    poolPnl = maximize ? marketInfo.pnlShortMax : marketInfo.pnlShortMin
  }

  if (poolPnl < 0) {
    return poolPnl
  }

  const maxPnlFactor: bigint = isLong
    ? marketInfo.maxPnlFactorForTradersLong
    : marketInfo.maxPnlFactorForTradersShort
  const maxPnl = applyFactor(poolUsd, maxPnlFactor)

  return poolPnl > maxPnl ? maxPnl : poolPnl
}
