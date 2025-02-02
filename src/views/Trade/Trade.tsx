import SkipLink from '@/components/SkipLink'
import WolfyNavbar from '@/components/WolfyNavbar'
import {getTokenMetadata} from '@/constants/tokens'
import HeadTags from '@/lib/head/HeadTags'
import useChainId from '@/lib/starknet/hooks/useChainId'
import {OHLCVEffects} from '@/lib/trade/hooks/useOHLCV'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import skipTargetProps from '@/utils/a11y/skipTargetProps'

import Chart from './components/Chart'
import Controller from './components/Controller'
import MarketInformation from './components/MarketInformation'
import UserInformation from './components/UserInformation'

export default function Trade() {
  const [chainId] = useChainId()
  const [tokenAddress] = useTokenAddress()
  const key = `${chainId}-${tokenAddress}`
  const symbol = (() => {
    if (!tokenAddress) return undefined
    return getTokenMetadata(chainId, tokenAddress).symbol
  })()

  return (
    <div>
      <HeadTags title='Trade' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <WolfyNavbar />
      <OHLCVEffects symbol={symbol} />
      <main
        className='flex items-center justify-center px-4 py-2'
        {...skipTargetProps('main-content')}
      >
        <div className='flex w-full flex-col gap-4 md:flex-row'>
          <div className='flex-1 md:max-w-[calc(100%_-_26rem)] lg:max-w-[calc(100%_-_30rem)]'>
            <MarketInformation />
            <Chart />
            <UserInformation />
          </div>
          <Controller key={key} />
        </div>
      </main>
    </div>
  )
}
