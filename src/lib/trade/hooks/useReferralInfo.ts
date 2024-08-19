import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchReferralInfo from '@/lib/trade/services/referral/fetchReferralInfo'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetReferralInfoQueryOptions(chainId: StarknetChainId, account: string | undefined) {
  return queryOptions({
    queryKey: ['referralInfo', chainId, account],
    queryFn: async () => {
      return await fetchReferralInfo(chainId, account)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useReferralInfo() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const {data} = useQuery(createGetReferralInfoQueryOptions(chainId, accountAddress))
  return data
}
