import {Icon} from '@iconify/react'
import {Button, Tooltip} from '@nextui-org/react'
import {memo} from 'react'
import {useLatest} from 'react-use'
import {toast} from 'sonner'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useChainIdIsSupportedMatched from '@/lib/starknet/hooks/useChainIdIsMatched'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import useCallback from '@/utils/hooks/useCallback'

export default memo(function CorrectNetworkButton() {
  const matched = useChainIdIsSupportedMatched()
  const [chainId] = useChainId()
  const latestChainId = useLatest(chainId)
  const [walletAccount] = useWalletAccount()
  const latestWalletAccount = useLatest(walletAccount)

  const handleCorrectNetwork = useCallback(async () => {
    if (!latestWalletAccount.current) return
    try {
      await latestWalletAccount.current.walletProvider.request({
        type: 'wallet_switchStarknetChain',
        params: {
          chainId: latestChainId.current,
        },
      })
    } catch (_e: unknown) {
      toast.error('Cannot switch chain, please switch manually in your wallet')
    }
  }, [])

  if (!matched)
    return (
      <Tooltip content='Wrong network'>
        <Button isIconOnly color='warning' onPress={handleCorrectNetwork}>
          <Icon icon='jam:triangle-danger-f' />
        </Button>
      </Tooltip>
    )

  return null
})
