import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchReferralInfo from '@/lib/trade/services/referral/fetchReferralInfo'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getReferralInfoQueryKey(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return ['referralInfo', chainId, accountAddress] as const
}

function createGetReferralInfoQueryOptions(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: getReferralInfoQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchReferralInfo(chainId, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useReferralInfoQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(createGetReferralInfoQueryOptions(chainId, accountAddress))
}
