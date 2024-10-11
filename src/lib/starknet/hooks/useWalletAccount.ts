import getStarknetCore from 'get-starknet-core'
import {useAtom, useSetAtom} from 'jotai'
import {useCallback} from 'react'
import type {WalletAccount} from 'starknet'

import {walletAccountAtom} from '@/lib/starknet/atoms'

import {useSetAccountAddress} from './useAccountAddress'
import {useSetShouldReconnect} from './useShouldReconnect'
import {useSetWalletChainId} from './useWalletChainId'

export default function useWalletAccount() {
  const [walletAccount, setWalletAccount] = useAtom(walletAccountAtom)
  const setWalletChainId = useSetWalletChainId()
  const setAccountAddress = useSetAccountAddress()
  const setShouldReconnect = useSetShouldReconnect()

  const disconnect = useCallback(
    async function () {
      await getStarknetCore.disconnect()
      setWalletAccount(undefined)
      setWalletChainId(undefined)
      setAccountAddress('')
      setShouldReconnect(false)
    },
    [setShouldReconnect, setWalletChainId, setAccountAddress],
  )

  return [walletAccount, disconnect] as const
}

export function useSetWalletAccount() {
  const setWalletAccount = useSetAtom(walletAccountAtom)
  const setAccountAddress = useSetAccountAddress()

  return useCallback(
    (walletAccount?: WalletAccount) => {
      setWalletAccount(walletAccount)
      setAccountAddress(walletAccount?.address ?? '')
    },
    [setWalletAccount, setAccountAddress],
  )
}
