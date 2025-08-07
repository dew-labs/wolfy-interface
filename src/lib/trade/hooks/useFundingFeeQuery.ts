import type {StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {FundingFeeData} from '@/lib/trade/services/fetchFundingFee'
import fetchFundingFee from '@/lib/trade/services/fetchFundingFee'
import type {Market} from '@/lib/trade/services/fetchMarkets'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getFundingQueryKey(params: {
  chainId: StarknetChainId
  market: Market
  accountAddress: string | undefined
}) {
  return ['fundingFee', params.chainId, params.market, params.accountAddress] as const
}

export function getFundingQueryOptions<TData = FundingFeeData, TError = Error>(
  params: Parameters<typeof getFundingQueryKey>[0],
  options?: Omit<UseQueryOptions<FundingFeeData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getFundingQueryKey(params),
    queryFn: async () => fetchFundingFee(params.chainId, params.market, params.accountAddress),
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export default function useFundingFeeQuery(market: Market, accountAddress?: string) {
  const [chainId] = useChainId()
  return useQuery(getFundingQueryOptions({chainId, market, accountAddress}))
}
