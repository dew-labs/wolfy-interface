import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {FundingFeeData} from '@/lib/trade/services/fetchFundingFee'
import fetchFundingFee from '@/lib/trade/services/fetchFundingFee'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsQuery from './useMarketsQuery'

export default function useFundingFeeQueries(): UseQueryResult<FundingFeeData>[]
export default function useFundingFeeQueries<T = FundingFeeData>(
  selector: MemoizedCallback<(data: FundingFeeData) => T>,
): UseQueryResult<T>[]
export default function useFundingFeeQueries() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()
  const {data: markets} = useMarketsQuery()

  const queries = useMemo(() => {
    return (
      markets?.map(market => ({
        queryKey: ['fundingFee', chainId, accountAddress, market],
        queryFn: async () => fetchFundingFee(chainId, market, accountAddress),
        ...NO_REFETCH_OPTIONS,
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      })) ?? []
    )
  }, [markets, chainId, accountAddress])

  return useQueries({
    queries,
    // combine(results) {
    //   const marketMap: FundingFeesData = new Map<string, FundingFeeData>()

    //   results.forEach(result => {
    //     if (!result.data) return
    //     marketMap.set(result.data.market, result.data)
    //   })

    //   return marketMap
    // },
  })
}
