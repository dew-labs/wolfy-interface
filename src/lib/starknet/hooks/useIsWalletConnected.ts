import {walletAccountAtom} from '@/lib/starknet/atoms'

const isConnectedAtom = atom(get => {
  return !!get(walletAccountAtom)
})

export default function useIsWalletConnected() {
  return useAtomValue(isConnectedAtom)
}

export function useGetIsWalletConnected() {
  const store = useStore()
  return useCallback(() => {
    return store.get(isConnectedAtom)
  }, [store])
}
