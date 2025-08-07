import {type StarknetChainId} from 'wolfy-sdk'

import {BLOCK_TIME} from '@/lib/starknet/constants'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasPriceQueryKey(params: {chainId: StarknetChainId}) {
  return ['gasPrice', params.chainId] as const
}

function getGasPriceQueryOptions<TData = bigint, TError = Error>(
  params: Parameters<typeof getGasPriceQueryKey>[0] & {blockTime: number},
  options?: Omit<UseQueryOptions<bigint, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getGasPriceQueryKey(params),
    queryFn: async () => {
      return await fetchGasPrice(params.chainId)
    },
    placeholderData: previousData => previousData ?? 0n,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: params.blockTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false,
    ...options,
  })
}

export default function useGasPriceQuery() {
  const [chainId] = useChainId()
  const blockTime = BLOCK_TIME[chainId]

  return useQuery(getGasPriceQueryOptions({chainId, blockTime}))
}
