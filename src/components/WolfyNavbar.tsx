import type {NavbarProps} from '@heroui/react'
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
} from '@heroui/react'
import {Link} from '@tanstack/react-router'
import BoringAvatar from 'boring-avatars'

import wolfyLogoDarkSvg from '@/assets/icons/wolfy-text-dark.svg'
import wolfyLogoLightSvg from '@/assets/icons/wolfy-text-light.svg'
import ChainSelect from '@/lib/starknet/components/ChainSelect'
import ConnectModal from '@/lib/starknet/components/ConnectModal'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useChainIdIsMatched from '@/lib/starknet/hooks/useChainIdIsMatched'
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
  {label: 'Trade', to: TradeRoute.fullPath, target: '_self', external: false},
  {label: 'Pools', to: PoolsRoute.fullPath, target: '_self', external: false},
  {label: 'Referrals', to: '', target: '_self', external: true},
  {label: 'Leaderboard', to: '', target: '_self', external: true},
  {label: 'Docs', to: 'https://docs.wolfy.trade/', target: '_blank', external: true},
] as const

const NAVBAR_MENU_MOTION_PROPS = {
  initial: {opacity: 0, y: -20},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -20},
  transition: {ease: 'easeInOut', duration: 0.2},
}

export default memo(function WolfyNavbar(props: Readonly<NavbarProps>) {
  const {t} = useTranslation()
  const [theme] = useCurrentTheme()
  const logoSvg = theme === Theme.Dark ? wolfyLogoDarkSvg : wolfyLogoLightSvg

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const connect = useConnect()
  const isConnected = useIsWalletConnected()
  const chainIdIsMatched = useChainIdIsMatched()
  const [, disconnect] = useWalletAccount()
  const accountAddress = useAccountAddress()

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  const [chainId] = useChainId()
  const [isDripping, handleOnDrip] = useDripFaucet()

  const navbarClassNames = useMemo(() => {
    return {
      base: cn('border-default-100 py-2', 'bg-transparent', {
        'bg-default-200/50 dark:bg-default-100/50': isMenuOpen,
      }),
      wrapper: 'gap-2 sm:gap-4 w-full justify-center px-2 sm:px-4',
      item: 'hidden md:flex',
    }
  }, [isMenuOpen])

  return (
    <>
      <ConnectModal />
      <Navbar
        {...props}
        classNames={navbarClassNames}
        height='60px'
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth='full'
        isBlurred={false}
      >
        <NavbarMenuToggle className='mb-1 text-default-400 md:hidden' />
        {/* Left Content */}
        <NavbarBrand className='flex grow-0'>
          <div className='mb-1 w-20 md:w-24'>
            <img src={logoSvg} alt='Wolfy Trade ' />
          </div>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify='start' className='hidden md:flex'>
          {menuItems.map(item => {
            return (
              <NavbarItem key={item.label}>
                {item.external ? (
                  <a className='mt-2 text-sm text-default-500' href={item.to} target={item.target}>
                    {t(item.label)}
                  </a>
                ) : (
                  <Link className='mt-2 text-sm text-default-500' to={item.to} target={item.target}>
                    {t(item.label)}
                  </Link>
                )}
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
            {isConnected && chainIdIsMatched && (
              <>
                <Button
                  onPress={handleOnDrip}
                  color='success'
                  endContent={<Icon icon='fa6-solid:faucet-drip' />}
                  className={'hidden md:flex'}
                  isLoading={isDripping}
                >
                  {isDripping ? t('Dripping...') : t('Faucet')}
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
            {isConnected && accountAddress && (
              <Dropdown placement='bottom-end'>
                <DropdownTrigger>
                  <button className='mt-1 size-8 transition-transform'>
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
            )}
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu
          className='top-[calc(var(--navbar-height)_-_1px)] mt-4 max-h-fit bg-default-200/50 pb-2 pt-4 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50'
          motionProps={NAVBAR_MENU_MOTION_PROPS}
        >
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              {item.external ? (
                <a
                  className='mb-2 flex w-full text-default-500'
                  href={item.to}
                  target={item.target}
                >
                  {t(item.label)}
                </a>
              ) : (
                <Link className='mb-2 flex w-full text-default-500' to={item.to}>
                  {t(item.label)}
                </Link>
              )}
              {index < menuItems.length - 1 && <Divider className='opacity-50' />}
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </>
  )
})
