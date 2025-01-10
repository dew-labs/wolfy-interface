import {useCallback, useMemo, useState} from 'react'
import {useLatest} from 'react-use'

import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'

export default function useMarket(
  tokenAddress: string | undefined,
  availableMarkets: MarketData[],
) {
  const [marketAddress, setMarketAddress] = useState<string>()
  const latestMarketAddress = useLatest(marketAddress)
  const {data: marketData} = useMarketsData(
    useCallback(data => data.get(marketAddress ?? ''), [marketAddress]),
  )
  const latestMarketData = useLatest(marketData)

  const poolName = marketData && getMarketPoolName(marketData)

  // TODO: available collateral token addresses should calculated from all pools
  const availableCollateralTokenAddresses = useMemo(
    () => (marketData ? [marketData.longTokenAddress, marketData.shortTokenAddress] : []),
    [marketData],
  )
  const latestAvailableCollateralTokenAddresses = useLatest(availableCollateralTokenAddresses)

  ;(function setDefaultMarketAddress() {
    if (!tokenAddress || !availableMarkets.length) return

    const currentMarketAddressIsAvailable =
      !!marketAddress &&
      availableMarkets.map(market => market.marketTokenAddress).includes(marketAddress)

    if (!currentMarketAddressIsAvailable) {
      setMarketAddress(availableMarkets[0]?.marketTokenAddress)
    }
  })()

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
