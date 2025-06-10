import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
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
  selector?: MemoizedCallback<(data: TokenBalancesData) => T>,
) {
  return queryOptions({
    queryKey: getTokenBalancesQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchTokenBalances(chainId, accountAddress)
    },
    select: selector as (data: TokenBalancesData) => T,
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  })
}

export default function useTokenBalancesQuery(): UseQueryResult<TokenBalancesData>
export default function useTokenBalancesQuery<T = TokenBalancesData>(
  selector: MemoizedCallback<(data: TokenBalancesData) => T>,
): UseQueryResult<T>
export default function useTokenBalancesQuery<T = TokenBalancesData>(
  selector?: MemoizedCallback<(data: TokenBalancesData) => T>,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(createGetTokenBalancesQueryOptions(chainId, accountAddress, selector))
}
