import {PRECISION} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'

import {getPoolUsdWithoutPnl} from './getPoolUsdWithoutPnl'

export function getMaxReservedUsd(marketInfo: MarketData, isLong: boolean) {
  const poolUsd = getPoolUsdWithoutPnl(marketInfo, isLong, 'min')

  let reserveFactor = isLong ? marketInfo.reserveFactorLong : marketInfo.reserveFactorShort

  const openInterestReserveFactor = isLong
    ? marketInfo.openInterestReserveFactorLong
    : marketInfo.openInterestReserveFactorShort

  if (openInterestReserveFactor < reserveFactor) {
    reserveFactor = openInterestReserveFactor
  }

  return (poolUsd * reserveFactor) / PRECISION
}
