import useChainId from '@/lib/starknet/hooks/useChainId'
import {getMarketsDataQueryOptions} from '@/lib/trade/hooks/useMarketsDataQuery'
import useMarketsQuery from '@/lib/trade/hooks/useMarketsQuery'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'

export default function useMarket(
  tokenAddress: string | undefined,
  availableMarkets: MarketData[],
) {
  const [chainId] = useChainId()
  const {data: markets} = useMarketsQuery()
  const [marketAddress, setMarketAddress] = useState<string>()
  const latestMarketAddress = useLatest(marketAddress)
  const {data: marketData} = useQuery(
    getMarketsDataQueryOptions(
      {chainId, markets},
      {
        select: useCallback(data => data.get(marketAddress ?? ''), [marketAddress]),
      },
    ),
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
