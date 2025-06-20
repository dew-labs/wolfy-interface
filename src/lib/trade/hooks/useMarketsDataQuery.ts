import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData, {type MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsQuery from './useMarketsQuery'

export function getMarketsDataQueryKey(chainId: StarknetChainId, markets: Market[] | undefined) {
  return ['marketsData', chainId, markets] as const
}

function createGetMarketsDataQueryOptions<T>(
  chainId: StarknetChainId,
  markets: Market[] | undefined,
  selector?: MemoizedCallback<(data: MarketsData) => T>,
) {
  return queryOptions({
    queryKey: getMarketsDataQueryKey(chainId, markets),
    queryFn: markets
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchMarketsData(chainId, markets, tokenPricesData)
        }
      : skipToken,
    placeholderData: keepPreviousData,
    select: selector as (data: MarketsData) => T,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useMarketsDataQuery(): UseQueryResult<MarketsData>
export default function useMarketsDataQuery<T = MarketsData>(
  selector: MemoizedCallback<(data: MarketsData) => T>,
): UseQueryResult<T>
export default function useMarketsDataQuery<T = MarketsData>(
  selector?: MemoizedCallback<(data: MarketsData) => T>,
) {
  const [chainId] = useChainId()
  const {data: markets} = useMarketsQuery()

  return useQuery(createGetMarketsDataQueryOptions(chainId, markets, selector))
}
