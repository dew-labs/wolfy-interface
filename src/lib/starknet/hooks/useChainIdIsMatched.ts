import {atom, useAtomValue} from 'jotai'

import {chainIdAtom, walletChainIdAtom} from '@/lib/starknet/atoms'

const chainIdIsSupportedMatchedAtom = atom(get => {
  const chainId = get(chainIdAtom)
  const walletChainId = get(walletChainIdAtom)
  return walletChainId ? (chainId as string) === walletChainId : true
})

export default function useChainIdIsSupportedMatched() {
  return useAtomValue(chainIdIsSupportedMatchedAtom)
}
