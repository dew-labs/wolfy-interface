import {
  cairoIntToBigInt,
  createSatoruMulticallRequest,
  DataStoreABI,
  SatoruContract,
  satoruMulticall,
  StarknetChainId,
} from 'satoru-sdk'
import {MIN_COLLATERAL_USD, MIN_POSITION_SIZE_USD} from 'satoru-sdk/dataStore'

export interface PositionConstants {
  minCollateralUsd: bigint
  minPositionSizeUsd: bigint
}

export default async function fetchPositionsConstants(chainId: StarknetChainId) {
  const [minCollateralUsd, minPositionSizeUsd] = await satoruMulticall(chainId, [
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_COLLATERAL_USD,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_POSITION_SIZE_USD,
    ]),
  ] as const)

  return {
    minCollateralUsd: cairoIntToBigInt(minCollateralUsd),
    minPositionSizeUsd: cairoIntToBigInt(minPositionSizeUsd),
  }
}
