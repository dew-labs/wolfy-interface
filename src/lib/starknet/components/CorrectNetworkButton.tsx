import {Button, Tooltip} from '@heroui/react'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useChainIdIsMatched from '@/lib/starknet/hooks/useChainIdIsMatched'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'

export default memo(function CorrectNetworkButton() {
  const matched = useChainIdIsMatched()
  const [chainId] = useChainId()
  const latestChainId = useLatest(chainId)
  const [walletAccount] = useWalletAccount()
  const latestWalletAccount = useLatest(walletAccount)

  const handleCorrectNetwork = useCallback(async () => {
    if (!latestWalletAccount.current) return
    try {
      await latestWalletAccount.current.walletProvider.request({
        type: 'wallet_switchStarknetChain',
        params: {chainId: latestChainId.current},
      })
    } catch {
      toast.error('Cannot switch chain, please switch manually in your wallet')
    }
  }, [])

  if (!matched)
    return (
      <Tooltip content='Wrong network' showArrow>
        <Button isIconOnly color='warning' onPress={handleCorrectNetwork}>
          <Icon icon='jam:triangle-danger-f' />
        </Button>
      </Tooltip>
    )

  return null
})
