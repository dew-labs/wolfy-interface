import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchPositions from '@/lib/trade/services/fetchPositions'
import type {TokensData} from '@/lib/trade/services/fetchTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'
import useTokensData from './useTokensData'

function createGetPositionQueryOptions(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  tokensData: TokensData | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['positions', chainId, accountAddress, marketsData, tokensData] as const,
    queryFn:
      marketsData && tokensData
        ? async () => {
            return await fetchPositions(chainId, marketsData, tokensData, accountAddress)
          }
        : skipToken,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function usePositionsData() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const tokensData = useTokensData()
  const {data} = useQuery(
    createGetPositionQueryOptions(chainId, marketsData, tokensData, accountAddress),
  )
  return data
}
