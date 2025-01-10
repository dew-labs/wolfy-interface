import type {StarknetChainId} from 'wolfy-sdk'
import {
  cairoIntToBigInt,
  claimableFundingAmountKey,
  createWolfyMulticallRequest,
  DataStoreABI,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'

import type {Market} from './fetchMarkets'

export interface FundingFeeData {
  market: string
  claimableFundingAmountLong: bigint
  claimableFundingAmountShort: bigint
}

export default async function fetchFundingFee(
  chainId: StarknetChainId,
  market: Market,
  accountAddress?: string,
): Promise<FundingFeeData> {
  if (!accountAddress) {
    return {
      market: market.marketTokenAddress,
      claimableFundingAmountLong: 0n,
      claimableFundingAmountShort: 0n,
    }
  }

  const [claimableFundingAmountLong, claimableFundingAmountShort] = await wolfyMulticall(chainId, [
    // claimableFundingAmountLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      claimableFundingAmountKey(market.marketTokenAddress, market.longTokenAddress, accountAddress),
    ]),
    // claimableFundingAmountShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      claimableFundingAmountKey(
        market.marketTokenAddress,
        market.shortTokenAddress,
        accountAddress,
      ),
    ]),
  ] as const)

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
