import {shouldReconnectAtom} from '@/lib/starknet/atoms'

export default function useShouldReconnect() {
  return useAtom(shouldReconnectAtom)
}

export function useSetShouldReconnect() {
  return useSetAtom(shouldReconnectAtom)
}

export function useGetShouldReconnect() {
  const store = useStore()
  return useCallback(() => store.get(shouldReconnectAtom), [store])
}
