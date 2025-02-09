import {atomWithStorage} from 'jotai/utils'

import {isNotTrigger, TradeMode} from './useTradeMode'

export const TradeType = {
  Long: 'Long',
  Short: 'Short',
  Swap: 'Swap',
} as const
export type TradeType = (typeof TradeType)[keyof typeof TradeType]

const tradeTypeAtom = atomWithStorage<TradeType>('orderType', TradeType.Long)

export default function useTradeType() {
  return useAtom(tradeTypeAtom)
}

export function useSetTradeType() {
  return useSetAtom(tradeTypeAtom)
}

export function isPosition(
  type: TradeType,
): type is typeof TradeType.Long | typeof TradeType.Short {
  return [TradeType.Long, TradeType.Short].includes(type)
}

export function isIncrease(type: TradeType, mode: TradeMode) {
  return isPosition(type) && isNotTrigger(mode)
}

export const TRADE_TYPE_LABEL: Record<TradeType, string> = {
  [TradeType.Long]: 'Long',
  [TradeType.Short]: 'Short',
  [TradeType.Swap]: 'Swap',
}
