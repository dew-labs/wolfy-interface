import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarketTokenBalances from '@/lib/trade/services/fetchMarketTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketTokenAddresses from './useMarketTokenAddresses'

export function getMarketTokenBalancesQueryKey(params: {
  chainId: StarknetChainId
  marketTokenAddresses: string[] | undefined
  accountAddress: string | undefined
}) {
  return [
    'marketTokenBalances',
    params.chainId,
    params.marketTokenAddresses,
    params.accountAddress,
  ] as const
}

export function getMarketTokenBalancesQueryOptions<TData = Map<string, bigint>, TError = Error>(
  params: Parameters<typeof getMarketTokenBalancesQueryKey>[0],
  options?: Omit<UseQueryOptions<Map<string, bigint>, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getMarketTokenBalancesQueryKey(params),
    queryFn: async () => {
      return await fetchMarketTokenBalances(
        params.chainId,
        params.marketTokenAddresses ?? [],
        params.accountAddress,
      )
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export default function useMarketTokenBalancesQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()
  const {data: marketTokenAddresses} = useMarketTokenAddresses()

  return useQuery(
    getMarketTokenBalancesQueryOptions({chainId, marketTokenAddresses, accountAddress}),
  )
}
