import {
  Card,
  CardBody,
  CircularProgress,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react'
import getStarknetCore, {
  Permission,
  type StarknetWindowObject,
  type WalletProvider,
} from 'get-starknet-core'
import {toast} from 'sonner'
import {WalletAccount} from 'starknet'
import type {ReadonlyDeep} from 'type-fest'
import {UAParser} from 'ua-parser-js'
import {getProvider, ProviderType, type StarknetChainId} from 'wolfy-sdk'

import {isConnectModalOpenAtom} from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useShouldReconnect from '@/lib/starknet/hooks/useShouldReconnect'
import {useSetWalletAccount} from '@/lib/starknet/hooks/useWalletAccount'
import {useSetWalletChainId} from '@/lib/starknet/hooks/useWalletChainId'
import useWallets from '@/lib/starknet/hooks/useWallets'
import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'
import UnexpectedError from '@/utils/api/UnexpectedError'
import toastErrorMessage from '@/utils/errors/toastErrorMessage'

interface AvailableWalletProps {
  wallet: StarknetWindowObject
  connect: MemoizedCallback<(wallet: StarknetWindowObject) => void>
  isLastConnected?: boolean
}

interface UnavailableWalletProps {
  wallet: WalletProvider
  isNotAvailable?: boolean
}

/* eslint-disable @eslint-react/prefer-destructuring-assignment -- conditional props*/
const Wallet = memo(function Wallet(
  props: ReadonlyDeep<UnavailableWalletProps | AvailableWalletProps>,
) {
  const [theme] = useCurrentTheme()

  const icon = (() => {
    if (typeof props.wallet.icon === 'string') return props.wallet.icon
    switch (theme) {
      case Theme.Light:
        return props.wallet.icon.light
      case Theme.Dark:
        return props.wallet.icon.dark
    }
  })()

  const handlePress = useCallback(() => {
    if ('isNotAvailable' in props && props.isNotAvailable) {
      const {browser} = UAParser(navigator.userAgent)
      const urls = props.wallet.downloads

      if (browser.name?.toLowerCase().includes('chrom') && 'chrome' in urls) {
        window.open(urls.chrome, '_blank')
      } else if (browser.name?.toLowerCase().includes('firefox') && 'firefox' in urls) {
        window.open(urls.firefox, '_blank')
      } else if (browser.name?.toLowerCase().includes('edge') && 'edge' in urls) {
        window.open(urls.edge, '_blank')
      } else {
        toast.error(
          'Browser not supported. Please install Chrome, Firefox, or Edge to connect to StarkNet.',
        )
      }

      return
    }

    if (!('connect' in props)) return

    try {
      props.connect(props.wallet)
    } catch (error) {
      throw new UnexpectedError(error)
    }
  }, [props])

  return (
    <li>
      <Card shadow='sm' isPressable onPress={handlePress} className='w-full'>
        <CardBody className='flex flex-row justify-center gap-2 p-2'>
          <Image shadow='none' radius='none' alt='' className='size-[24px]' src={icon} />
          <div className='flex flex-row gap-2'>
            <div>
              <b>{props.wallet.name}</b>
            </div>
            {'isLastConnected' in props && props.isLastConnected && (
              <div className='text-default-500'>(Last connected)</div>
            )}
            {'isNotAvailable' in props && props.isNotAvailable && (
              <div className='text-default-500'>(Not installed)</div>
            )}
          </div>
        </CardBody>
      </Card>
    </li>
  )
})

function useConnect({
  onConnected,
  onCancel,
}: {
  onConnected?: MemoizedCallback<() => void>
  onCancel?: MemoizedCallback<() => void>
}) {
  const setWalletAccount = useSetWalletAccount()
  const setWalletChainId = useSetWalletChainId()
  const [shouldReconnect, setShouldReconnect] = useShouldReconnect()
  const isConnected = useIsWalletConnected()

  const [isConnecting, setIsConnecting] = useState(false)
  const latestIsConnecting = useLatest(isConnecting)
  const isCancelled = useRef(false)

  const shouldStopConnectingOrContinue = useCallback(() => {
    if (isCancelled.current) {
      isCancelled.current = false
      throw new Error('Connection cancelled')
    }
  }, [])

  const connect = useCallback(
    async (wallet: StarknetWindowObject) => {
      setIsConnecting(true)
      try {
        const connectedWallet = await getStarknetCore.enable(wallet)
        shouldStopConnectingOrContinue()

        const connectedWalletChainId = (await connectedWallet.request({
          type: 'wallet_requestChainId',
        })) as StarknetChainId
        shouldStopConnectingOrContinue()

        const walletAccount = await WalletAccount.connect(
          getProvider(ProviderType.HTTP, connectedWalletChainId),
          connectedWallet,
        )
        shouldStopConnectingOrContinue()

        const permissions = (await connectedWallet.request({
          type: 'wallet_getPermissions',
        })) as Permission[]
        shouldStopConnectingOrContinue()

        if (!permissions.includes(Permission.ACCOUNTS)) {
          throw new Error('The connected wallet does not have the required permissions')
        }

        const accounts = await connectedWallet.request({type: 'wallet_requestAccounts'})
        shouldStopConnectingOrContinue()

        if (accounts.length === 0) {
          throw new Error('The connected wallet does not have any accounts')
        }

        await walletAccount.getBlockLatestAccepted()
        shouldStopConnectingOrContinue()

        setWalletAccount(walletAccount)
        setWalletChainId(connectedWalletChainId)
        setShouldReconnect(true)
      } catch (error: unknown) {
        console.error(error)
        toastErrorMessage(error, 'Unexpected error occurred while connecting to the wallet')
        void getStarknetCore.disconnect()
        setShouldReconnect(false)
      }

      setIsConnecting(false)
      onConnected?.()
    },
    [
      setShouldReconnect,
      setWalletAccount,
      setWalletChainId,
      shouldStopConnectingOrContinue,
      onConnected,
    ],
  )

  const cancel = useCallback(() => {
    if (latestIsConnecting.current) isCancelled.current = true
    setIsConnecting(false)
    onCancel?.()
  }, [onCancel])

  return {shouldReconnect, isConnected, isConnecting, connect, cancel}
}

export default memo(function ConnectModal() {
  const [isOpen, setIsOpen] = useAtom(isConnectModalOpenAtom)

  const {isConnecting, isConnected, connect, shouldReconnect, cancel} = useConnect({
    onConnected: useCallback(() => {
      setIsOpen(false)
    }, []),
    onCancel: useCallback(() => {
      setIsOpen(false)
    }, []),
  })

  const latestIsWalletConnected = useLatest(isConnected)

  const handleClose = useCallback(() => {
    cancel()
  }, [cancel])

  const {data: wallets} = useWallets()

  useEffect(
    function connectToLastConnectedWallet() {
      if (!wallets?.lastConnectedWallet) return
      if (!shouldReconnect) return
      if (latestIsWalletConnected.current) return

      void connect(wallets.lastConnectedWallet)
    },
    [connect, shouldReconnect, wallets?.lastConnectedWallet],
  )

  return (
    <Modal isOpen={isOpen} placement={'center'} onOpenChange={handleClose} backdrop='blur'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Select a wallet</ModalHeader>
        <ModalBody className='mb-4 w-full'>
          {isConnecting && (
            <div className='flex w-full justify-center'>
              <CircularProgress label='Connecting...' />
            </div>
          )}
          {!isConnecting && (
            <ul className='flex flex-col gap-3'>
              {wallets?.lastConnectedWallet && (
                <Wallet wallet={wallets.lastConnectedWallet} connect={connect} isLastConnected />
              )}
              {wallets?.lowerPriorityWallets.map(wallet => (
                <Wallet key={wallet.id} wallet={wallet} connect={connect} />
              ))}
              {wallets?.unavailableWallets.map(wallet => (
                <Wallet key={wallet.id} wallet={wallet} isNotAvailable />
              ))}
            </ul>
            // TODO: Add a switch to let user choose to reconnect to the last connected wallet in the next time
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
/* eslint-enable @eslint-react/prefer-destructuring-assignment */
