import SkipLink from '@/components/SkipLink'
import WolfyNavbar from '@/components/WolfyNavbar'
import HeadTags from '@/lib/head/HeadTags'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import skipTargetProps from '@/utils/a11y/skipTargetProps'

import Chart from './components/Chart'
import Controller from './components/Controller'
import MarketInformation from './components/MarketInformation'
import UserInformation from './components/UserInformation'

export default function Home() {
  const [tokenAddress] = useTokenAddress()

  return (
    <div>
      <HeadTags title='Home' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <WolfyNavbar />
      <main
        className='mx-auto flex max-w-[1536px] items-center justify-center p-4'
        {...skipTargetProps('main-content')}
      >
        <div className='flex w-full flex-row gap-4'>
          <div className='w-full'>
            <MarketInformation />
            <Chart />
            <UserInformation />
          </div>
          <Controller key={tokenAddress} />
        </div>
      </main>
    </div>
  )
}
