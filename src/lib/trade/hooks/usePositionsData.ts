import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, skipToken, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions from '@/lib/trade/services/fetchPositions'
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

function createGetPositionsQueryOptions(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  previousMarketsData: MarketsData | undefined,
  accountAddress: string | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: getPositionsQueryKey(chainId, marketsData, accountAddress),
    queryFn: marketsData
      ? async () => {
          const tokenPricesData = await fetchTokenPrices(chainId)
          return await fetchPositions(chainId, marketsData, tokenPricesData, accountAddress)
        }
      : skipToken,
    placeholderData: () => {
      if (!previousMarketsData) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchPositions>>>(
        getPositionsQueryKey(chainId, previousMarketsData, accountAddress),
      )
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function usePositionsData() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const previousMarketsData = usePreviousDistinct(marketsData)
  const queryClient = useQueryClient()

  const {data} = useQuery(
    createGetPositionsQueryOptions(
      chainId,
      marketsData,
      previousMarketsData,
      accountAddress,
      queryClient,
    ),
  )
  return data
}
