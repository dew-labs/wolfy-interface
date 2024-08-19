import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData from '@/lib/trade/services/fetchMarketsData'
import type {TokensData} from '@/lib/trade/services/fetchTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarkets from './useMarkets'
import useTokensData from './useTokensData'

function createGetMarketsDataQueryOptions(
  chainId: StarknetChainId,
  markets: Market[] | undefined,
  tokensData: TokensData | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['marketsData', chainId, markets, tokensData, accountAddress] as const,
    queryFn:
      markets && tokensData
        ? async () => {
            return await fetchMarketsData(chainId, markets, tokensData, accountAddress)
          }
        : skipToken,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useMarketsData() {
  const [chainId] = useChainId()
  const markets = useMarkets()
  const tokensData = useTokensData()
  const accountAddress = useAccountAddress()

  const {data: marketsData} = useQuery(
    createGetMarketsDataQueryOptions(chainId, markets, tokensData, accountAddress),
  )

  return marketsData
}
