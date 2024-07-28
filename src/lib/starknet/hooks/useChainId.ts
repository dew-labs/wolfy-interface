import {useAtom, useSetAtom} from 'jotai'

import {chainIdAtom} from '@/lib/starknet/atoms'

export default function useChainId() {
  return useAtom(chainIdAtom)
}

export function useSetChainId() {
  return useSetAtom(chainIdAtom)
}
