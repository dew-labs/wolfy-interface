import {
  Card,
  CardBody,
  CircularProgress,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react'
import getStarknetCore, {
  Permission,
  type StarknetWindowObject,
  type WalletProvider,
} from 'get-starknet-core'
import {useAtom} from 'jotai'
import {memo, type MemoizedCallback, useCallback, useEffect, useRef, useState} from 'react'
import {useLatest} from 'react-use'
import {toast} from 'sonner'
import {WalletAccount} from 'starknet'
import {UAParser} from 'ua-parser-js'
import {getProvider, ProviderType, type StarknetChainId} from 'wolfy-sdk'

import {isConnectModalOpenAtom} from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useShouldReconnect from '@/lib/starknet/hooks/useShouldReconnect'
import {useSetWalletAccount} from '@/lib/starknet/hooks/useWalletAccount'
import {useSetWalletChainId} from '@/lib/starknet/hooks/useWalletChainId'
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

const Wallet = memo(function Wallet(props: UnavailableWalletProps | AvailableWalletProps) {
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
      <Card
        shadow='sm'
        isPressable
        onPress={handlePress}
        className='align-center justify-content-center w-full'
      >
        <CardBody className='align-center flex flex-row justify-center gap-2 p-2'>
          <Image shadow='none' radius='none' alt='' className='h-[24px] w-[24px]' src={icon} />
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

export default memo(function ConnectModal() {
  const [isOpen, setIsOpen] = useAtom(isConnectModalOpenAtom)

  const setWalletAccount = useSetWalletAccount()
  const setWalletChainId = useSetWalletChainId()
  const [shouldReconnect, setShouldReconnect] = useShouldReconnect()

  const [wallets, setWallets] = useState<StarknetWindowObject[]>([])
  const [lastConnectedWallet, setLastConnectedWallet] = useState<StarknetWindowObject>()
  const [unavailableWallets, setUnavailableWallets] = useState<WalletProvider[]>([])
  const isWalletConnected = useIsWalletConnected()
  const latestIsWalletConnected = useLatest(isWalletConnected)

  const [isConnecting, setIsConnecting] = useState(false)
  const latestIsConnecting = useLatest(isConnecting)
  const isCancelled = useRef(false)

  const handleClose = useCallback(() => {
    if (latestIsConnecting.current) isCancelled.current = true
    setIsConnecting(false)
    setIsOpen(false)
  }, [])

  const shouldStopConnectingOrContinue = useCallback(() => {
    if (isCancelled.current) {
      isCancelled.current = false
      throw new Error('Connection cancelled')
    }
  }, [])

  useEffect(
    function loadWallets() {
      void (async () => {
        // TODO:retry
        const [newWallets, discoveryWallets, newLastConnectedWallet] = await Promise.all([
          getStarknetCore.getAvailableWallets(),
          getStarknetCore.getDiscoveryWallets(),
          getStarknetCore.getLastConnectedWallet(),
        ])

        setLastConnectedWallet(newLastConnectedWallet ?? undefined)

        const lowerPriorityWallets = newWallets.filter(wallet =>
          newLastConnectedWallet?.id ? wallet.id !== newLastConnectedWallet.id : true,
        )
        setWallets(lowerPriorityWallets)

        const newUnavailableWallets = discoveryWallets.filter(
          wallet => !newWallets.some(w => w.name === wallet.name),
        )
        setUnavailableWallets(newUnavailableWallets)
      })()
    },
    [isOpen],
  )

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

        const accounts = await connectedWallet.request({
          type: 'wallet_requestAccounts',
        })
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
      setIsOpen(false)
    },
    [setShouldReconnect, setWalletAccount, setWalletChainId, shouldStopConnectingOrContinue],
  )

  useEffect(() => {
    if (!lastConnectedWallet) return
    if (!shouldReconnect) return
    if (latestIsWalletConnected.current) return

    void connect(lastConnectedWallet)
  }, [connect, shouldReconnect, lastConnectedWallet])

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
              {lastConnectedWallet && (
                <Wallet wallet={lastConnectedWallet} connect={connect} isLastConnected />
              )}
              {wallets.map(wallet => (
                <Wallet key={wallet.id} wallet={wallet} connect={connect} />
              ))}
              {unavailableWallets.map(wallet => (
                <Wallet key={wallet.id} wallet={wallet} isNotAvailable />
              ))}
            </ul>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
