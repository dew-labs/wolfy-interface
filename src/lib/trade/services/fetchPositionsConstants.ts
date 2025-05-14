import {
  cairoIntToBigInt,
  createWolfyMulticallRequest,
  DataStoreABI,
  StarknetChainId,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'
import {MIN_COLLATERAL_USD, MIN_POSITION_SIZE_USD} from 'wolfy-sdk/dataStore'

export interface PositionConstants {
  minCollateralUsd: bigint
  minPositionSizeUsd: bigint
}

export const DEFAULT_POSITION_CONSTANTS: PositionConstants = {
  minCollateralUsd: 0n,
  minPositionSizeUsd: 0n,
}

export default async function fetchPositionsConstants(chainId: StarknetChainId) {
  const [minCollateralUsd, minPositionSizeUsd] = await wolfyMulticall(chainId, [
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_COLLATERAL_USD,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      MIN_POSITION_SIZE_USD,
    ]),
  ] as const)

  return {
    minCollateralUsd: cairoIntToBigInt(minCollateralUsd),
    minPositionSizeUsd: cairoIntToBigInt(minPositionSizeUsd),
  }
}
