import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenBalances from '@/lib/trade/services/fetchTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenBalancesQueryKey(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return ['tokenBalances', chainId, accountAddress] as const
}

function createGetTokenBalancesQueryOptions(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: getTokenBalancesQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchTokenBalances(chainId, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    throwOnError: false,
  })
}

export default function useTokenBalances() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  return useQuery(createGetTokenBalancesQueryOptions(chainId, accountAddress))
}
