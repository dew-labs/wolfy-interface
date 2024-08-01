import {memo, useEffect} from 'react'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'

// Request wallet to switch chain to our desired chain
export default memo(function ChainSwitchRequester() {
  const [chainId] = useChainId()
  const [walletAccount] = useWalletAccount()

  useEffect(() => {
    if (!walletAccount) return
    const thisWalletAccount = walletAccount

    void (async () => {
      try {
        const currentChainId = await thisWalletAccount.getChainId()
        if (currentChainId !== chainId) {
          await thisWalletAccount.switchStarknetChain(chainId)
        }
      } catch (_e: unknown) {
        toast.error('Cannot switch chain, please switch manually in your wallet')
      }
    })()
  }, [chainId, walletAccount])

  return null
})
