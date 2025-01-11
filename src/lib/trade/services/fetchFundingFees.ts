import invariant from 'tiny-invariant'
import {
  cairoIntToBigInt,
  claimableFundingAmountKey,
  createWolfyMulticallRequest,
  DataStoreABI,
  type StarknetChainId,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'

import chunkify from '@/utils/chunkify'

import {type FundingFeeData} from './fetchFundingFee'
import type {Market} from './fetchMarkets'

export type FundingFeesData = Map<string, FundingFeeData>

export default async function fetchFundingFees(
  chainId: StarknetChainId,
  markets: Market[],
  accountAddress: string,
) {
  const marketChunks = Array.from(chunkify(markets, 50))

  const results = await Promise.all(
    marketChunks.map(async markets => {
      const claimableFundingAmountLongCalls = markets.map(market =>
        createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
          claimableFundingAmountKey(
            market.marketTokenAddress,
            market.longTokenAddress,
            accountAddress,
          ),
        ]),
      )

      const claimableFundingAmountShortCalls = markets.map(market =>
        createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
          claimableFundingAmountKey(
            market.marketTokenAddress,
            market.shortTokenAddress,
            accountAddress,
          ),
        ]),
      )

      const results = await wolfyMulticall(chainId, [
        ...claimableFundingAmountLongCalls,
        ...claimableFundingAmountShortCalls,
      ])

      const claimableFundingAmountLongs = results.slice(0, results.length / 2)
      const claimableFundingAmountShorts = results.slice(results.length / 2)

      return {
        markets,
        claimableFundingAmountLongs,
        claimableFundingAmountShorts,
      }
    }),
  )

  const marketMap = new Map<string, FundingFeeData>()

  results.forEach(({markets, claimableFundingAmountLongs, claimableFundingAmountShorts}) => {
    markets.forEach((market, index) => {
      invariant(claimableFundingAmountLongs[index])
      invariant(claimableFundingAmountShorts[index])

      marketMap.set(market.marketTokenAddress, {
        market: market.marketTokenAddress,
        claimableFundingAmountLong: cairoIntToBigInt(claimableFundingAmountLongs[index]),
        claimableFundingAmountShort: cairoIntToBigInt(claimableFundingAmountShorts[index]),
      })
    })
  })

  return marketMap
}
