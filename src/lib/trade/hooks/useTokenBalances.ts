import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenBalances from '@/lib/trade/services/fetchTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetTokenBalancesQueryOptions(chainId: StarknetChainId, accountAddress: string) {
  return queryOptions({
    queryKey: ['tokenBalances', chainId, accountAddress] as const,
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
  const {data} = useQuery(createGetTokenBalancesQueryOptions(chainId, accountAddress))
  return data
}
