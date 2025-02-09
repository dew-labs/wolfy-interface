import {atomWithStorage} from 'jotai/utils'

export const TradeMode = {Market: 'Market', Limit: 'Limit', Trigger: 'Trigger'} as const
export type TradeMode = (typeof TradeMode)[keyof typeof TradeMode]

const tradeModeAtom = atomWithStorage<TradeMode>('executionType', TradeMode.Market)

export default function useTradeMode() {
  return useAtom(tradeModeAtom)
}

export function useSetTradeMode() {
  return useSetAtom(tradeModeAtom)
}

export function isNotTrigger(
  mode: TradeMode,
): mode is typeof TradeMode.Market | typeof TradeMode.Limit {
  return mode !== TradeMode.Trigger
}

export const TRADE_MODE_LABEL: Record<TradeMode, string> = {
  [TradeMode.Market]: 'Market',
  [TradeMode.Limit]: 'Limit',
  [TradeMode.Trigger]: 'TP/SL',
}
