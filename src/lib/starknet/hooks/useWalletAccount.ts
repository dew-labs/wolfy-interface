import getStarknetCore from 'get-starknet-core'
import {useAtom, useSetAtom} from 'jotai'

import {walletAccountAtom} from '@/lib/starknet/atoms'
import useCallback from '@/utils/hooks/useCallback'

import {useSetWalletChainId} from './useWalletChainId'

export default function useWalletAccount() {
  const [walletAccount, setWalletAccount] = useAtom(walletAccountAtom)
  const setWalletChainId = useSetWalletChainId()

  const disconnect = useCallback(
    async function () {
      await getStarknetCore.disconnect()
      setWalletAccount(undefined)
      setWalletChainId(undefined)
    },
    [setWalletChainId],
  )

  return [walletAccount, disconnect] as const
}

export function useSetWalletAccount() {
  return useSetAtom(walletAccountAtom)
}
