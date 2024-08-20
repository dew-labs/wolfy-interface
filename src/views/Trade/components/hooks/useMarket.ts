import {useMemo, useState} from 'react'
import {useLatest} from 'react-use'

import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'

export default function useMarket() {
  const marketsData = useMarketsData()
  const [marketAddress, setMarketAddress] = useState<string>()
  const latestMarketAddress = useLatest(marketAddress)

  const marketData = useMemo(
    () => (marketAddress ? marketsData?.get(marketAddress) : undefined),
    [marketAddress, marketsData],
  )
  const latestMarketData = useLatest(marketData)

  const poolName = marketData && getMarketPoolName(marketData)

  const availableCollateralTokenAddresses = useMemo(
    () => (marketData ? [marketData.longTokenAddress, marketData.shortTokenAddress] : []),
    [marketData],
  )
  const latestAvailableCollateralTokenAddresses = useLatest(availableCollateralTokenAddresses)

  return {
    marketAddress,
    setMarketAddress,
    latestMarketAddress,
    marketData,
    latestMarketData,
    availableCollateralTokenAddresses,
    latestAvailableCollateralTokenAddresses,
    poolName,
  }
}
