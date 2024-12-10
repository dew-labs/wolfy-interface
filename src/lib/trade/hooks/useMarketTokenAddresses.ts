import useMarkets from './useMarkets'

export default function useMarketTokenAddresses() {
  return useMarkets(data =>
    data
      .values()
      .map(market => market.marketTokenAddress)
      .toArray(),
  )
}
