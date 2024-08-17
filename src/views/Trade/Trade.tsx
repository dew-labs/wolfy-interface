import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import SkipLink from '@/components/SkipLink'
import WolfyNavbar from '@/components/WolfyNavbar'
import HeadTags from '@/lib/head/HeadTags'
import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarkets from '@/lib/trade/services/fetchMarkets'
import fetchPositionsConstants from '@/lib/trade/services/fetchPositionsConstants'
import fetchTokensData from '@/lib/trade/services/fetchTokensData'
import fetchUiFeeFactor from '@/lib/trade/services/fetchUiFeeFactor'
import fetchReferralInfo from '@/lib/trade/services/referral/fetchReferralInfo'
import skipTargetProps from '@/utils/a11y/skipTargetProps'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import Chart from './components/Chart'
import Controller from './components/Controller'
import MarketInformation from './components/MarketInformation'
import UserInformation from './components/UserInformation'

function createGetUiFeeFactor(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['uiFeeFactor', chainId] as const,
    queryFn: async ({queryKey}) => {
      return await fetchUiFeeFactor(queryKey[1])
    },
    ...NO_REFETCH_OPTIONS,
  })
}
function createGetMarketsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['markets', chainId] as const,
    queryFn: async ({queryKey}) => {
      return await fetchMarkets(queryKey[1])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

function createGetTokensQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: ['tokens', chainId, accountAddress] as const,
    queryFn: async ({queryKey}) => {
      return await fetchTokensData(queryKey[1], queryKey[2])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

function createGetPositionsConstantsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['positionsConstants', chainId] as const,
    queryFn: async ({queryKey}) => {
      return await fetchPositionsConstants(queryKey[1])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

function createGetReferralInfoQueryOptions(chainId: StarknetChainId, account: string | undefined) {
  return queryOptions({
    queryKey: ['referralInfo', chainId, account] as const,
    queryFn: async ({queryKey}) => {
      return await fetchReferralInfo(queryKey[1], queryKey[2])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function Home() {
  const accountAddress = useAccountAddress()
  const [chainId] = useChainId()

  useQuery(createGetMarketsQueryOptions(chainId))
  useQuery(createGetTokensQueryOptions(chainId, accountAddress))
  useQuery(createGetUiFeeFactor(chainId))
  useQuery(createGetPositionsConstantsQueryOptions(chainId))
  useQuery(createGetReferralInfoQueryOptions(chainId, accountAddress))

  return (
    <div>
      <HeadTags title='Home' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <WolfyNavbar />
      <main
        className='mx-auto flex max-w-7xl items-center justify-center p-4'
        {...skipTargetProps('main-content')}
      >
        <div className='flex w-full flex-row gap-4'>
          <div className='w-full'>
            <MarketInformation />
            <Chart />
            <UserInformation />
          </div>
          <Controller />
        </div>
      </main>
    </div>
  )
}
