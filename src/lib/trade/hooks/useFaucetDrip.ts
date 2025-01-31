import {toast} from 'sonner'

import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import dripFaucet from '@/lib/trade/services/dripFaucet'
import errorMessageOrUndefined from '@/utils/errors/errorMessageOrUndefined'

export default function useDripFaucet() {
  const isConnected = useIsWalletConnected()
  const latestIsConnected = useLatest(isConnected)
  const [walletAccount] = useWalletAccount()
  const latestWalletAccount = useLatest(walletAccount)
  const [isDripping, setIsDripping] = useState(false)

  const handleOnDrip = useCallback(() => {
    if (!latestIsConnected.current) return
    if (!latestWalletAccount.current) return

    setIsDripping(true)

    toast.promise(dripFaucet(latestWalletAccount.current), {
      loading: 'Dripping...',
      success: () => {
        return 'Faucet drip successful'
      },
      error: error => {
        return errorMessageOrUndefined(error) ?? 'Faucet drip failed'
      },
      finally: () => {
        setIsDripping(false)
      },
    })
  }, [])

  return [isDripping, handleOnDrip] as const
}
