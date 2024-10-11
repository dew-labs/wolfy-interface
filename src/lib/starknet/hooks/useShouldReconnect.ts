import {useAtom, useSetAtom} from 'jotai'

import {shouldReconnectAtom} from '@/lib/starknet/atoms'

export default function useShouldReconnect() {
  return useAtom(shouldReconnectAtom)
}

export function useSetShouldReconnect() {
  return useSetAtom(shouldReconnectAtom)
}
