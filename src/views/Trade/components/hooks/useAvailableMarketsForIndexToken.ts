import useMarketsData from '@/lib/trade/hooks/useMarketsData'

export default function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  return useMarketsData(data => {
    if (!indexTokenAddress) return []

    return data
      .values()
      .toArray()
      .filter(market => market.indexTokenAddress === indexTokenAddress)
  })
}
