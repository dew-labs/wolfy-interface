import {
  cairoIntToBigInt,
  createSatoruMulticallRequest,
  DataStoreABI,
  SatoruContract,
  satoruMulticall,
  StarknetChainId,
} from 'satoru-sdk'

import {MIN_COLLATERAL_USD_KEY, MIN_POSITION_SIZE_USD_KEY} from '@/constants/dataStore'

export interface PositionsConstants {
  minCollateralUsd: bigint
  minPositionSizeUsd: bigint
}

export default async function fetchPositionsConstants(chainId: StarknetChainId) {
  const [minCollateralUsd, minPositionSizeUsd] = await satoruMulticall(chainId, [
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_COLLATERAL_USD_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_POSITION_SIZE_USD_KEY,
    ]),
  ] as const)

  return {
    minCollateralUsd: cairoIntToBigInt(minCollateralUsd),
    minPositionSizeUsd: cairoIntToBigInt(minPositionSizeUsd),
  }
}
