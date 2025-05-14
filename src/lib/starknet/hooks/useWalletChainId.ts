import {walletChainIdAtom} from '@/lib/starknet/atoms'

export default function useWalletChainId() {
  return useAtom(walletChainIdAtom)
}

export function useSetWalletChainId() {
  return useSetAtom(walletChainIdAtom)
}
