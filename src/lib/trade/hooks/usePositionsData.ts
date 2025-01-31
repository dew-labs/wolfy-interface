import type {UseQueryResult} from '@tanstack/react-query'
import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions, {type PositionsData} from '@/lib/trade/services/fetchPositions'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'

export function getPositionsQueryKey(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  accountAddress: string | undefined,
) {
  return ['positions', chainId, accountAddress, marketsData] as const
}

function createGetPositionsQueryOptions<T>(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  accountAddress: string | undefined,
  selector?: MemoizedCallback<(data: PositionsData) => T>,
) {
  return queryOptions({
    queryKey: getPositionsQueryKey(chainId, marketsData, accountAddress),
    queryFn: marketsData
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchPositions(chainId, marketsData, tokenPricesData, accountAddress)
        }
      : skipToken,
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
    select: selector as (data: PositionsData) => T,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function usePositionsData(): UseQueryResult<PositionsData>
export default function usePositionsData<T = PositionsData>(
  selector: MemoizedCallback<(data: PositionsData) => T>,
): UseQueryResult<T>
export default function usePositionsData<T = PositionsData>(
  selector?: MemoizedCallback<(data: PositionsData) => T>,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const {data: marketsData} = useMarketsData()

  return useQuery(createGetPositionsQueryOptions(chainId, marketsData, accountAddress, selector))
}
