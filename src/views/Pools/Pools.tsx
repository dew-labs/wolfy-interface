import {Icon} from '@iconify/react'
import {Button} from '@nextui-org/react'

import SkipLink from '@/components/SkipLink'
import WolfyNavbar from '@/components/WolfyNavbar'
import HeadTags from '@/lib/head/HeadTags'
import skipTargetProps from '@/utils/a11y/skipTargetProps'

import DepositWithdrawalHistory from './components/DepositWithdrawalHistory'
import PoolsTable from './components/PoolsTable'

export default function Pools() {
  return (
    <div>
      <HeadTags title='Pools' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <WolfyNavbar />
      <main className='px-4 py-2' {...skipTargetProps('main-content')}>
        <div className='m-auto mb-6 flex w-full max-w-7xl items-center justify-between'>
          <div className='flex flex-col'>
            <h1 className='text-xl font-bold text-default-900 lg:text-3xl'>Pools</h1>
            <p className='text-small text-default-400 lg:text-medium'>
              Purchase WM Tokens to earn fees from leverage trading
            </p>
          </div>
          <Button
            className='bg-foreground text-background'
            startContent={
              <Icon className='flex-none text-background/60' icon='lucide:plus' width={16} />
            }
          >
            New Pool
          </Button>
        </div>
        <div className='m-auto mb-4 max-w-7xl'>
          <PoolsTable />
          <DepositWithdrawalHistory />
        </div>
      </main>
    </div>
  )
}
