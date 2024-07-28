import {Button} from '@nextui-org/react'

import SkipLink from '@/components/SkipLink'
import WolfyNavbar from '@/components/WolfyNavbar'
import HeadTags from '@/lib/head/HeadTags'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import skipTargetProps from '@/utils/a11y/skipTargetProps'

export default function Home() {
  const [walletAccount] = useWalletAccount()

  const checkAccount = () => {
    console.log(walletAccount)
  }

  return (
    <div>
      <HeadTags title='Home' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <WolfyNavbar />
      <main
        className='flex max-w-[1024px] items-center justify-center'
        {...skipTargetProps('main-content')}
      >
        <Button onPress={checkAccount}>Check account</Button>
      </main>
    </div>
  )
}
