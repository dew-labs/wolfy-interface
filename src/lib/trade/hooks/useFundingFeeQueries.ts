import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'

import {getFundingQueryOptions} from './useFundingFeeQuery'
import useMarketsQuery from './useMarketsQuery'

export default function useFundingFeeQueries() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()
  const {data: markets} = useMarketsQuery()

  const queries = useMemo(() => {
    return markets?.map(market => getFundingQueryOptions({chainId, market, accountAddress})) ?? []
  }, [markets, chainId, accountAddress]) as ReturnType<typeof getFundingQueryOptions>[]

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
