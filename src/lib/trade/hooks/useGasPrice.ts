import {type StarknetChainId} from 'wolfy-sdk'

import {BLOCK_TIME} from '@/lib/starknet/constants'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasPriceQueryKey(chainId: StarknetChainId) {
  return ['gasPrice', chainId] as const
}

function createGetGasPriceQueryOptions(chainId: StarknetChainId, blockTime: number) {
  return queryOptions({
    queryKey: getGasPriceQueryKey(chainId),
    queryFn: async () => {
      return await fetchGasPrice(chainId)
    },
    placeholderData: previousData => previousData ?? 0n,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: blockTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false,
  })
}

export default function useGasPrice() {
  const [chainId] = useChainId()
  const blockTime = BLOCK_TIME[chainId]

  return useQuery(createGetGasPriceQueryOptions(chainId, blockTime))
}
