import type {AccountChangeEventHandler, NetworkChangeEventHandler} from 'get-starknet-core'
import {toast} from 'sonner'

import {isChainIdSupported} from '@/constants/chains'
import {useSetAccountAddress} from '@/lib/starknet/hooks/useAccountAddress'
import {useSetChainId} from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import {useSetWalletChainId} from '@/lib/starknet/hooks/useWalletChainId'

// Subscribe to the wallet's chain changes and switch chain if we support it
export default memo(function ChainSwitchSubscriber() {
  const [walletAccount] = useWalletAccount()
  const setChainId = useSetChainId()
  const setWalletChainId = useSetWalletChainId()
  const setAccountAddress = useSetAccountAddress()

  useEffect(() => {
    if (!walletAccount) return

    const networkChangedHandler: NetworkChangeEventHandler = chainId => {
      console.log(`Network changed to chainId: ${chainId}`)
      setWalletChainId(chainId)

      if (!isChainIdSupported(chainId)) {
        console.log('Unsupported chain id', chainId)
        return
      }
      setChainId(chainId)
      toast.success('Chain switched successfully')
    }

    walletAccount.walletProvider.on('networkChanged', networkChangedHandler)

    const accountChangedHandler: AccountChangeEventHandler = accounts => {
      console.log(`Accounts changed:`, accounts)
      if (accounts?.[0]) {
        setAccountAddress(accounts[0])
      }
    }

    walletAccount.walletProvider.on('accountsChanged', accountChangedHandler)

    return () => {
      walletAccount.walletProvider.off('networkChanged', networkChangedHandler)
      walletAccount.walletProvider.off('accountsChanged', accountChangedHandler)
    }
  }, [walletAccount, setChainId, setWalletChainId, setAccountAddress])

  return null
})
