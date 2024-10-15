import {Icon} from '@iconify/react'
import type {NavbarProps} from '@nextui-org/react'
import {
  Badge,
  Button,
  cn,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@nextui-org/react'
import {Link} from '@tanstack/react-router'
import BoringAvatar from 'boring-avatars'
import {memo, useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'

import wolfyLogoDarkSvg from '@/assets/icons/wolfy-text-dark.svg'
import wolfyLogoLightSvg from '@/assets/icons/wolfy-text-light.svg'
import ChainSelect from '@/lib/starknet/components/ChainSelect'
import ConnectModal from '@/lib/starknet/components/ConnectModal'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useConnect from '@/lib/starknet/hooks/useConnect'
import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'
import useDripFaucet from '@/lib/trade/hooks/useFaucetDrip'
import {PoolsRoute, TradeRoute} from '@/routeRegistry'
import middleEllipsis from '@/utils/middleEllipsis'

import ThemeSwitchButton from './ThemeSwitchButton'

const menuItems = [
  {
    label: 'Trade',
    to: TradeRoute.fullPath,
  },
  {
    label: 'Pools',
    to: PoolsRoute.fullPath,
  },
  {
    label: 'Referrals',
    to: '',
  },
  {
    label: 'Leaderboard',
    to: '',
  },
  {
    label: 'Docs',
    to: '',
  },
]

export default memo(function WolfyNavbar(props: NavbarProps) {
  const {t} = useTranslation()
  const [theme] = useCurrentTheme()
  const logoSvg = theme === Theme.Dark ? wolfyLogoDarkSvg : wolfyLogoLightSvg

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const connect = useConnect()
  const isConnected = useIsWalletConnected()
  const [, disconnect] = useWalletAccount()
  const accountAddress = useAccountAddress()

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  const [chainId] = useChainId()
  const [isDripping, handleOnDrip] = useDripFaucet()

  return (
    <>
      <ConnectModal />
      <Navbar
        {...props}
        classNames={{
          base: cn('border-default-100 py-2', 'bg-transparent', {
            'bg-default-200/50 dark:bg-default-100/50': isMenuOpen,
          }),
          wrapper: 'gap-2 sm:gap-4 w-full justify-center px-2 sm:px-4',
          item: 'hidden md:flex',
        }}
        height='60px'
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth='full'
        isBlurred={false}
      >
        <NavbarMenuToggle className='mb-1 text-default-400 md:hidden' />
        {/* Left Content */}
        <NavbarBrand className='flex flex-grow-0'>
          <div className='mb-1 w-20 md:w-24'>
            <img src={logoSvg} alt='Wolfy Trade ' />
          </div>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify='start' className='align-center hidden md:flex'>
          {menuItems.map(item => {
            return (
              <NavbarItem key={item.label}>
                <Link className='mt-2 text-sm text-default-500' to={item.to}>
                  {t(item.label)}
                </Link>
              </NavbarItem>
            )
          })}
        </NavbarContent>

        {/* Right Content */}
        <NavbarContent className='flex' justify='end'>
          <NavbarItem className='ml-2 flex gap-2'>
            <ThemeSwitchButton />
            <ChainSelect />
            {!isConnected && (
              <>
                <Button
                  onPress={connect}
                  color='primary'
                  endContent={<Icon icon='solar:alt-arrow-right-linear' />}
                  className={'hidden md:flex'}
                >
                  {t('Connect')}
                </Button>
                <Button onPress={connect} color='primary' isIconOnly className={'md:hidden'}>
                  <Icon icon='lets-icons:sign-in-squre-fill' />
                </Button>
              </>
            )}
            {isConnected && (
              <>
                <Button
                  onPress={handleOnDrip}
                  color='success'
                  endContent={<Icon icon='fa6-solid:faucet-drip' />}
                  className={'hidden md:flex'}
                  isLoading={isDripping}
                >
                  {!isDripping ? t('Faucet') : t('Dripping...')}
                </Button>
                <Button
                  onPress={handleOnDrip}
                  color='success'
                  className={'md:hidden'}
                  isLoading={isDripping}
                  isIconOnly
                >
                  <Icon icon='fa6-solid:faucet-drip' />
                </Button>
              </>
            )}
            {isConnected && (
              <>
                <Dropdown placement='bottom-end'>
                  <DropdownTrigger>
                    <button className='mt-1 h-8 w-8 transition-transform'>
                      <Badge color='success' content='' placement='bottom-right' shape='circle'>
                        {!!accountAddress && (
                          <BoringAvatar size='32px' variant='beam' name={accountAddress} />
                        )}
                      </Badge>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Profile Actions' variant='flat'>
                    <DropdownItem key='profile'>
                      <a
                        href={getScanUrl(chainId, ScanType.Contract, accountAddress)}
                        target='_blank'
                        rel='noreferrer'
                        className='font-semibold'
                      >
                        {!!accountAddress && middleEllipsis(accountAddress)}
                      </a>
                    </DropdownItem>
                    <DropdownItem key='settings'>{t('Settings')}</DropdownItem>
                    <DropdownItem key='disconnect' color='danger' onPress={handleDisconnect}>
                      {t('Disconnect')}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu
          className='top-[calc(var(--navbar-height)_-_1px)] mt-4 max-h-fit bg-default-200/50 pb-2 pt-4 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50'
          motionProps={{
            initial: {opacity: 0, y: -20},
            animate: {opacity: 1, y: 0},
            exit: {opacity: 0, y: -20},
            transition: {
              ease: 'easeInOut',
              duration: 0.2,
            },
          }}
        >
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link className='text-d mb-2 flex w-full text-default-500' to={item.to}>
                {t(item.label)}
              </Link>
              {index < menuItems.length - 1 && <Divider className='opacity-50' />}
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </>
  )
})
