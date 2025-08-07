import useChainId from '@/lib/starknet/hooks/useChainId'
import {getMarketsDataQueryOptions} from '@/lib/trade/hooks/useMarketsDataQuery'
import useMarketsQuery from '@/lib/trade/hooks/useMarketsQuery'

export default function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  const [chainId] = useChainId()
  const {data: markets} = useMarketsQuery()

  return useQuery(
    getMarketsDataQueryOptions(
      {chainId, markets},
      {
        select: useCallback(
          data => {
            if (!indexTokenAddress) return []

            return Array.from(data.values()).filter(
              market => market.indexTokenAddress === indexTokenAddress,
            )
          },
          [indexTokenAddress],
        ),
      },
    ),
  )
}
