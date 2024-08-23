import {useAtom, useSetAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

export enum TradeMode {
  Market = 'Market',
  Limit = 'Limit',
  Trigger = 'Trigger',
}

const tradeModeAtom = atomWithStorage<TradeMode>('executionType', TradeMode.Market)

export default function useTradeMode() {
  return useAtom(tradeModeAtom)
}

export function useSetTradeMode() {
  return useSetAtom(tradeModeAtom)
}

export function isNotTrigger(mode: TradeMode): mode is TradeMode.Market | TradeMode.Limit {
  return mode !== TradeMode.Trigger
}

export const TRADE_MODE_LABEL: Record<TradeMode, string> = {
  [TradeMode.Market]: 'Market',
  [TradeMode.Limit]: 'Limit',
  [TradeMode.Trigger]: 'TP/SL',
}
