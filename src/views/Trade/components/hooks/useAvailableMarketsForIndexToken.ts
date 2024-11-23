import {useMemo} from 'react'

import useMarketsData from '@/lib/trade/hooks/useMarketsData'

export default function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  const {data: marketsData} = useMarketsData()

  return useMemo(() => {
    if (!indexTokenAddress || !marketsData?.size) return []

    const markets = Array.from(marketsData.values())

    return markets.filter(market => market.indexTokenAddress === indexTokenAddress)
  }, [marketsData, indexTokenAddress])
}
