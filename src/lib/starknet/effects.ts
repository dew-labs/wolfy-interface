import type {AccountChangeEventHandler, NetworkChangeEventHandler} from 'get-starknet-core'
import {atomEffect} from 'jotai-effect'
import {toast} from 'sonner'

import {isChainIdSupported} from '@/constants/chains'

import {accountAddressAtom, chainIdAtom, walletAccountAtom, walletChainIdAtom} from './atoms'

export const requestChainSwitchEffect = atomEffect(get => {
  const chainId = get(chainIdAtom)
  const walletAccount = get.peek(walletAccountAtom)

  if (!walletAccount) return

  void (async () => {
    try {
      const currentChainId = await walletAccount.getChainId()
      if (currentChainId !== chainId) {
        // @ts-expect-error -- SN_KATANA is not an official chainId
        await walletAccount.switchStarknetChain(chainId)
      }
    } catch {
      toast.error('Cannot switch chain, please switch manually in your wallet')
    }
  })()
})

export const walletChainIdChangeEffect = atomEffect((get, set) => {
  const walletAccount = get(walletAccountAtom)

  if (!walletAccount) return

  const networkChangedHandler: NetworkChangeEventHandler = chainId => {
    console.log(`Network changed to chainId: ${chainId}`)
    set(walletChainIdAtom, chainId)

    if (!isChainIdSupported(chainId)) {
      console.log('Unsupported chain id', chainId)
      return
    }
    set(chainIdAtom, chainId)
    toast.success('Chain switched successfully')
  }

  walletAccount.walletProvider.on('networkChanged', networkChangedHandler)

  const accountChangedHandler: AccountChangeEventHandler = accounts => {
    console.log(`Accounts changed:`, accounts)
    if (accounts?.[0]) {
      set(accountAddressAtom, accounts[0])
    }
  }

  walletAccount.walletProvider.on('accountsChanged', accountChangedHandler)

  return () => {
    walletAccount.walletProvider.off('networkChanged', networkChangedHandler)
    walletAccount.walletProvider.off('accountsChanged', accountChangedHandler)
  }
})
