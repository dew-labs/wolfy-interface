import {useAtom, useSetAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

export enum OrderType {
  Long,
  Short,
  Swap,
}

const orderTypeAtom = atomWithStorage<OrderType>('orderType', OrderType.Long)

export default function useOrderType() {
  return useAtom(orderTypeAtom)
}

export function useSetOrderType() {
  return useSetAtom(orderTypeAtom)
}
