import {useCallback} from 'react'

import useMarketsData from '@/lib/trade/hooks/useMarketsData'

export default function useAvailableMarketsForIndexToken(indexTokenAddress: string | undefined) {
  return useMarketsData(
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
