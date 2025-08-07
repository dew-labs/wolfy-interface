import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenBalances, {type TokenBalancesData} from '@/lib/trade/services/fetchTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenBalancesQueryKey(params: {
  chainId: StarknetChainId
  accountAddress: string | undefined
}) {
  return ['tokenBalances', params.chainId, params.accountAddress] as const
}

export function getTokenBalancesQueryOptions<TData = TokenBalancesData, TError = Error>(
  params: Parameters<typeof getTokenBalancesQueryKey>[0],
  options?: Omit<UseQueryOptions<TokenBalancesData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getTokenBalancesQueryKey(params),
    queryFn: async () => {
      return await fetchTokenBalances(params.chainId, params.accountAddress)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
    ...options,
  })
}

export default function useTokenBalancesQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(getTokenBalancesQueryOptions({chainId, accountAddress}))
}
