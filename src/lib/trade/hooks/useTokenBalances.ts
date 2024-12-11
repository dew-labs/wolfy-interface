import {queryOptions, useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokenBalances, {type TokenBalancesData} from '@/lib/trade/services/fetchTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getTokenBalancesQueryKey(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return ['tokenBalances', chainId, accountAddress] as const
}

function createGetTokenBalancesQueryOptions<T = TokenBalancesData>(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  selector?: (data: TokenBalancesData) => T,
) {
  return queryOptions({
    queryKey: getTokenBalancesQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchTokenBalances(chainId, accountAddress)
    },
    select: selector as (data: TokenBalancesData) => T,
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  })
}

export default function useTokenBalances(): UseQueryResult<TokenBalancesData>
export default function useTokenBalances<T = TokenBalancesData>(
  selector: (data: TokenBalancesData) => T,
): UseQueryResult<T>
export default function useTokenBalances<T = TokenBalancesData>(
  selector?: (data: TokenBalancesData) => T,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  return useQuery(createGetTokenBalancesQueryOptions(chainId, accountAddress, selector))
}
