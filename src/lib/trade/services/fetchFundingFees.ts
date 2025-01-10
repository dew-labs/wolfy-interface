import {type StarknetChainId} from 'wolfy-sdk'

import fetchFundingFee, {type FundingFeeData} from './fetchFundingFee'
import type {Market} from './fetchMarkets'

export type FundingFeesData = Map<string, FundingFeeData>

export default async function fetchFundingFees(
  chainId: StarknetChainId,
  markets: Market[],
  accountAddress: string,
) {
  const results = await Promise.allSettled(
    markets.map(async market => {
      return await fetchFundingFee(chainId, market, accountAddress)
    }),
  )

  const marketMap = new Map<string, FundingFeeData>()

  results.forEach(result => {
    if (result.status !== 'fulfilled') return
    marketMap.set(result.value.market, result.value)
  })

  return marketMap
}
