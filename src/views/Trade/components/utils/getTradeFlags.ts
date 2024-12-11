import {TradeMode} from '@/lib/trade/states/useTradeMode'
import {TradeType} from '@/lib/trade/states/useTradeType'
export interface TradeFlags {
  isLong: boolean
  isShort: boolean
  isSwap: boolean
  /**
   * ```ts
   * isLong || isShort
   * ```
   */
  isPosition: boolean
  isIncrease: boolean
  isTrigger: boolean
  isMarket: boolean
  isLimit: boolean
}

export default function getTradeFlags(tradeType: TradeType, tradeMode: TradeMode): TradeFlags {
  const isLong = tradeType === TradeType.Long
  const isShort = tradeType === TradeType.Short
  const isSwap = tradeType === TradeType.Swap
  const isPosition = isLong || isShort
  const isMarket = tradeMode === TradeMode.Market
  const isLimit = tradeMode === TradeMode.Limit
  const isTrigger = tradeMode === TradeMode.Trigger
  const isIncrease = isPosition && (isMarket || isLimit)

  const tradeFlags: TradeFlags = {
    isLong,
    isShort,
    isSwap,
    isPosition,
    isIncrease,
    isMarket,
    isLimit,
    isTrigger,
  }

  return tradeFlags
}
