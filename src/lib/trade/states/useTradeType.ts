import {useAtom, useSetAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

import {isNotTrigger, TradeMode} from './useTradeMode'

export enum TradeType {
  Long = 'Long',
  Short = 'Short',
  Swap = 'Swap',
}

const tradeTypeAtom = atomWithStorage<TradeType>('orderType', TradeType.Long)

export default function useTradeType() {
  return useAtom(tradeTypeAtom)
}

export function useSetTradeType() {
  return useSetAtom(tradeTypeAtom)
}

export function isPosition(type: TradeType): type is TradeType.Long | TradeType.Short {
  return [TradeType.Long, TradeType.Short].includes(type)
}

export function isIncrease(type: TradeType, mode: TradeMode) {
  return isPosition(type) && isNotTrigger(mode)
}
