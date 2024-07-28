import {atom, useAtomValue} from 'jotai'

import {walletAccountAtom} from '@/lib/starknet/atoms'

const isConnectedAtom = atom(get => {
  return !!get(walletAccountAtom)
})
export default function useIsWalletConnected() {
  return useAtomValue(isConnectedAtom)
}
