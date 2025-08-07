import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions, {type PositionsData} from '@/lib/trade/services/fetchPositions'
import fetchTokenPrices from '@/lib/trade/services/fetchTokenPrices'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsDataQuery from './useMarketsDataQuery'

export function getPositionsQueryKey(params: {
  chainId: StarknetChainId
  marketsData: MarketsData | undefined
  accountAddress: string | undefined
}) {
  return ['positions', params.chainId, params.accountAddress, params.marketsData] as const
}

export function getPositionsQueryOptions<TData = PositionsData, TError = Error>(
  params: Parameters<typeof getPositionsQueryKey>[0],
  options?: Omit<UseQueryOptions<PositionsData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getPositionsQueryKey(params),
    queryFn: params.marketsData
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(params.chainId)
          invariant(params.marketsData)
          return await fetchPositions(
            params.chainId,
            params.marketsData,
            tokenPricesData,
            params.accountAddress,
          )
        }
      : skipToken,
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export default function usePositionsDataQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()
  const {data: marketsData} = useMarketsDataQuery()

  return useQuery(getPositionsQueryOptions({chainId, marketsData, accountAddress}))
}
