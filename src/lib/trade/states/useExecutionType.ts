import {useAtom, useSetAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

export enum ExecutionType {
  Market,
  Limit,
  TPSL,
}

const executionTypeAtom = atomWithStorage<ExecutionType>('executionType', ExecutionType.Market)

export default function useExecutionType() {
  return useAtom(executionTypeAtom)
}

export function useSetExecutionType() {
  return useSetAtom(executionTypeAtom)
}
