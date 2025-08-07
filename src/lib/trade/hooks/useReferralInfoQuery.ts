import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchReferralInfo, {type ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getReferralInfoQueryKey(params: {
  chainId: StarknetChainId
  accountAddress: string | undefined
}) {
  return ['referralInfo', params.chainId, params.accountAddress] as const
}

export function getReferralInfoQueryOptions<TData = ReferralInfo | null, TError = Error>(
  params: Parameters<typeof getReferralInfoQueryKey>[0],
  options?: Omit<UseQueryOptions<ReferralInfo | null, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getReferralInfoQueryKey(params),
    queryFn: async () => {
      return await fetchReferralInfo(params.chainId, params.accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
    ...options,
  })
}

export default function useReferralInfoQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(getReferralInfoQueryOptions({chainId, accountAddress}))
}
