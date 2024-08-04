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
  useDisclosure,
} from '@nextui-org/react'
import {Link} from '@tanstack/react-router'
import BoringAvatar from 'boring-avatars'
import {memo, useState} from 'react'
import {useTranslation} from 'react-i18next'

import useIsWalletConnected from '@/lib/starknet/hooks/useIsWalletConnected'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import {FaucetRoute, TradeRoute} from '@/routeRegistry'
import useCallback from '@/utils/hooks/useCallback'
import middleEllipsis from '@/utils/middleEllipsis'

import ChainSelect from './ChainSelect'
import ChainSwitchRequester from './ChainSwitchRequester'
import ChainSwitchSubscriber from './ChainSwitchSubscriber'
import ConnectModal from './ConnectModal'
import ThemeSwitchButton from './ThemeSwitchButton'

const menuItems = [
  {
    label: 'Trade',
    to: TradeRoute.fullPath,
  },
  // {
  //   label: 'Stake',
  //   to: '',
  // },
  // {
  //   label: 'Pools',
  //   to: '',
  // },
  {
    label: 'Faucet',
    to: FaucetRoute.fullPath,
  },
]

export default memo(function WolfyNavbar(props: NavbarProps) {
  const {t} = useTranslation()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {isOpen, onOpen, onOpenChange} = useDisclosure()
  const isConnected = useIsWalletConnected()
  const [walletAccount, disconnect] = useWalletAccount()

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  return (
    <>
      <ChainSwitchRequester />
      <ChainSwitchSubscriber />
      <ConnectModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <Navbar
        {...props}
        classNames={{
          base: cn('border-default-100', {
            'bg-default-200/50 dark:bg-default-100/50': isMenuOpen,
          }),
          wrapper: 'w-full justify-center',
          item: 'hidden md:flex',
        }}
        height='60px'
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth='2xl'
      >
        <NavbarMenuToggle className='text-default-400 md:hidden' />
        {/* Left Content */}
        <NavbarBrand className='flex-grow-0'>
          {/* <div className='rounded-full bg-foreground text-background'>
            <Icon icon='solar:alt-arrow-right-linear' />
          </div> */}
          <span className='text-large font-medium'>{t('Wolfy')}</span>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify='start'>
          {menuItems.map(item => {
            return (
              <NavbarItem key={item.label}>
                <Link className='text-sm text-default-500' to={item.to}>
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
                  onPress={onOpen}
                  color='primary'
                  endContent={<Icon icon='solar:alt-arrow-right-linear' />}
                  className={'w-full'}
                >
                  {t('Connect')}
                </Button>
              </>
            )}
            {isConnected && (
              <>
                <Dropdown placement='bottom-end'>
                  <DropdownTrigger>
                    <button className='mt-1 h-8 w-8 transition-transform'>
                      <Badge color='success' content='' placement='bottom-right' shape='circle'>
                        <BoringAvatar size='32px' variant='beam' name={walletAccount?.address} />
                      </Badge>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Profile Actions' variant='flat'>
                    <DropdownItem key='profile'>
                      <p className='font-semibold'>
                        {!!walletAccount?.address && middleEllipsis(walletAccount.address)}
                      </p>
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
          className='top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50'
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
