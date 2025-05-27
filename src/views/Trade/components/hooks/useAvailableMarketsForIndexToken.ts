import useMarketsDataQuery from '@/lib/trade/hooks/useMarketsDataQuery'

export default function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  return useMarketsDataQuery(
    useCallback(
      data => {
        if (!indexTokenAddress) return []

        return Array.from(data.values()).filter(
          market => market.indexTokenAddress === indexTokenAddress,
        )
      },
      [indexTokenAddress],
    ),
  )
}
