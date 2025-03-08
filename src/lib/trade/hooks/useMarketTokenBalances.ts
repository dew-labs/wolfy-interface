import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchMarketTokenBalances from '@/lib/trade/services/fetchMarketTokenBalances'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketTokenAddresses from './useMarketTokenAddresses'

export function getMarketTokenBalancesQueryKey(
  chainId: StarknetChainId,
  marketTokenAddresses: string[] | undefined,
  accountAddress: string | undefined,
) {
  return ['marketTokenBalances', chainId, marketTokenAddresses, accountAddress] as const
}

function createGetMarketTokenBalancesQueryOptions<T = Map<string, bigint>>(
  chainId: StarknetChainId,
  marketTokenAddresses: string[] | undefined,
  accountAddress: string | undefined,
  selector?: MemoizedCallback<(data: Map<string, bigint>) => T>,
) {
  return queryOptions({
    queryKey: getMarketTokenBalancesQueryKey(chainId, marketTokenAddresses, accountAddress),
    queryFn: async () => {
      return await fetchMarketTokenBalances(chainId, marketTokenAddresses ?? [], accountAddress)
    },
    select: selector as (data: Map<string, bigint>) => T,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketTokenBalances(): UseQueryResult<Map<string, bigint>>
export default function useMarketTokenBalances<T = Map<string, bigint>>(
  selector: MemoizedCallback<(data: Map<string, bigint>) => T>,
): UseQueryResult<T>
export default function useMarketTokenBalances<T = Map<string, bigint>>(
  selector?: MemoizedCallback<(data: Map<string, bigint>) => T>,
): UseQueryResult<T> {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const {data: marketTokenAddresses} = useMarketTokenAddresses()

  return useQuery(
    createGetMarketTokenBalancesQueryOptions(
      chainId,
      marketTokenAddresses,
      accountAddress,
      selector,
    ),
  )
}
