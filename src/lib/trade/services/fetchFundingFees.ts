import {
  cairoIntToBigInt,
  claimableFundingAmountKey,
  createWolfyMulticallRequest,
  DataStoreABI,
  type StarknetChainId,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'

import {logError} from '@/utils/logger'

import type {Market} from './fetchMarkets'

export interface FundingFeeData {
  market: string
  claimableFundingAmountLong: bigint
  claimableFundingAmountShort: bigint
}

export type FundingFeesData = Map<string, FundingFeeData>

export default async function fetchMarketsData(
  chainId: StarknetChainId,
  markets: Market[],
  accountAddress: string,
) {
  const results = await Promise.allSettled(
    markets.map(async market => {
      try {
        if (accountAddress) {
          const [claimableFundingAmountLong, claimableFundingAmountShort] = await wolfyMulticall(
            chainId,
            [
              // claimableFundingAmountLong
              createWolfyMulticallRequest(
                chainId,
                WolfyContract.DataStore,
                DataStoreABI,
                'get_u256',
                [
                  claimableFundingAmountKey(
                    market.marketTokenAddress,
                    market.longTokenAddress,
                    accountAddress,
                  ),
                ],
              ),
              // claimableFundingAmountShort
              createWolfyMulticallRequest(
                chainId,
                WolfyContract.DataStore,
                DataStoreABI,
                'get_u256',
                [
                  claimableFundingAmountKey(
                    market.marketTokenAddress,
                    market.shortTokenAddress,
                    accountAddress,
                  ),
                ],
              ),
            ] as const,
          )

          const marketDivisor = market.isSameCollaterals ? 2n : 1n

          return {
            market: market.marketTokenAddress,
            claimableFundingAmountLong: claimableFundingAmountLong
              ? cairoIntToBigInt(claimableFundingAmountLong) / marketDivisor
              : 0n,

            claimableFundingAmountShort: claimableFundingAmountShort
              ? cairoIntToBigInt(claimableFundingAmountShort) / marketDivisor
              : 0n,
          }
        }
      } catch (e: unknown) {
        logError(e)
      }
      return {
        market: market.marketTokenAddress,
        claimableFundingAmountLong: 0n,
        claimableFundingAmountShort: 0n,
      }
    }),
  )

  const marketMap = new Map<string, FundingFeeData>()

  results.forEach(result => {
    if (result.status !== 'fulfilled') return
    marketMap.set(result.value.market, result.value)
  })

  return marketMap
}
