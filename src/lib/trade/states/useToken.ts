import {useAtom, useSetAtom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

const tokenAtom = atomWithStorage<string | undefined>('selectedToken', undefined)

export default function useToken() {
  return useAtom(tokenAtom)
}

export function useSetToken() {
  return useSetAtom(tokenAtom)
}
