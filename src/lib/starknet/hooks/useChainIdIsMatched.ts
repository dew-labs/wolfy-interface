import {chainIdAtom, walletChainIdAtom} from '@/lib/starknet/atoms'

const chainIdIsMatchedAtom = atom(get => {
  const chainId = get(chainIdAtom)
  const walletChainId = get(walletChainIdAtom)
  return walletChainId ? (chainId as string) === walletChainId : true
})

export default function useChainIdIsMatched() {
  return useAtomValue(chainIdIsMatchedAtom)
}
