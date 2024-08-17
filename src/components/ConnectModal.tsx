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
import {memo, type MemoizedCallback, useCallback, useEffect, useRef, useState} from 'react'
import {useLatest} from 'react-use'
import {getProvider, ProviderType, type StarknetChainId} from 'satoru-sdk'
import {WalletAccount} from 'starknet'

import {isChainIdSupported} from '@/constants/chains'
import {useSetWalletAccount} from '@/lib/starknet/hooks/useWalletAccount'
import {useSetWalletChainId} from '@/lib/starknet/hooks/useWalletChainId'
import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'
import UnexpectedError from '@/utils/api/UnexpectedError'
import toastErrorMessage from '@/utils/errors/toastErrorMessage'

interface AvailableWalletProps {
  wallet: StarknetWindowObject
  connect: (wallet: StarknetWindowObject) => void
  isLastConnected?: boolean
}

interface UnavailableWalletProps {
  wallet: WalletProvider
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
      default:
        return props.wallet.icon.dark
    }
  })()

  return (
    <li>
      <Card
        shadow='sm'
        isPressable
        onPress={() => {
          if (!('connect' in props)) return
          try {
            props.connect(props.wallet)
          } catch (error) {
            throw new UnexpectedError(error)
          }
        }}
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
          </div>
        </CardBody>
      </Card>
    </li>
  )
})

interface ConnectModalProps {
  isOpen: boolean
  onClose: MemoizedCallback<() => void>
}

export default memo(function ConnectModal({isOpen, onClose}: ConnectModalProps) {
  const setWalletAccount = useSetWalletAccount()
  const setWalletChainId = useSetWalletChainId()

  const [wallets, setWallets] = useState<StarknetWindowObject[]>([])
  const [lastConnectedWallet, setLastConnectedWallet] = useState<StarknetWindowObject>()
  const [unavailableWallets, setUnavailableWallets] = useState<WalletProvider[]>([])

  const [isConnecting, setIsConnecting] = useState(false)
  const latestIsConnecting = useLatest(isConnecting)
  const isCancelled = useRef(false)

  const handleClose = useCallback(() => {
    if (latestIsConnecting.current) isCancelled.current = true
    setIsConnecting(false)
    onClose()
  }, [onClose])

  const shouldStopConnectingOrContinue = useCallback(() => {
    if (isCancelled.current) {
      isCancelled.current = false
      throw new Error('Connection cancelled')
    }
  }, [])

  useEffect(() => {
    void (async function () {
      // TODO:retry
      const [wallets, discoveryWallets, lastConnectedWallet] = await Promise.all([
        getStarknetCore.getAvailableWallets(),
        getStarknetCore.getDiscoveryWallets(),
        getStarknetCore.getLastConnectedWallet(),
      ])

      setLastConnectedWallet(lastConnectedWallet ?? undefined)

      const lowerPriorityWallets = wallets.filter(wallet =>
        lastConnectedWallet?.id ? wallet.id !== lastConnectedWallet.id : true,
      )
      setWallets(lowerPriorityWallets)

      const unavailableWallets = discoveryWallets.filter(
        wallet => !wallets.some(w => w.name === wallet.name),
      )
      setUnavailableWallets(unavailableWallets)
    })()
  }, [isOpen])

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

        const walletAccount = new WalletAccount(
          isChainIdSupported(connectedWalletChainId)
            ? getProvider(ProviderType.HTTP, connectedWalletChainId)
            : {},
          connectedWallet,
        )

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
      } catch (error: unknown) {
        console.error(error)
        toastErrorMessage(error, 'Unexpected error occurred while connecting to the wallet')
        void getStarknetCore.disconnect()
      }
      setIsConnecting(false)
      onClose()
    },
    [onClose, setWalletAccount, setWalletChainId, shouldStopConnectingOrContinue],
  )
  useEffect(() => {
    console.log('lastConnectedWallet:', lastConnectedWallet)
    if (!lastConnectedWallet) return

    void connect(lastConnectedWallet)
  }, [lastConnectedWallet, connect])

  return (
    <Modal isOpen={isOpen} placement={'top-center'} onOpenChange={handleClose} backdrop='blur'>
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
                <Wallet key={wallet.id} wallet={wallet} />
              ))}
            </ul>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
})
