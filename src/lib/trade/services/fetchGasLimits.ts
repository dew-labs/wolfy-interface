import {
  cairoIntToBigInt,
  createWolfyMulticallRequest,
  DataStoreABI,
  type StarknetChainId,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'
import {
  DECREASE_ORDER_GAS_LIMIT,
  depositGasLimitKey,
  ESTIMATED_GAS_FEE_BASE_AMOUNT,
  ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR,
  INCREASE_ORDER_GAS_LIMIT,
  SINGLE_SWAP_GAS_LIMIT,
  SWAP_ORDER_GAS_LIMIT,
  WITHDRAWAL_GAS_LIMIT,
} from 'wolfy-sdk/dataStore'

export interface GasLimitsConfig {
  depositSingleToken: bigint
  depositMultiToken: bigint
  withdrawalMultiToken: bigint
  singleSwap: bigint
  swapOrder: bigint
  increaseOrder: bigint
  decreaseOrder: bigint
  estimatedFeeBaseGasLimit: bigint
  estimatedFeeMultiplierFactor: bigint
}

export const DEFAULT_GAS_LIMITS: GasLimitsConfig = {
  depositSingleToken: 0n,
  depositMultiToken: 0n,
  withdrawalMultiToken: 0n,
  singleSwap: 0n,
  swapOrder: 0n,
  increaseOrder: 0n,
  decreaseOrder: 0n,
  estimatedFeeBaseGasLimit: 0n,
  estimatedFeeMultiplierFactor: 0n,
}

export default async function fetchGasLimits(chainId: StarknetChainId): Promise<GasLimitsConfig> {
  const [
    depositSingleToken,
    depositMultiToken,
    withdrawalMultiToken,
    singleSwap,
    swapOrder,
    increaseOrder,
    decreaseOrder,
    estimatedFeeBaseGasLimit,
    estimatedFeeMultiplierFactor,
  ] = await wolfyMulticall(chainId, [
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      depositGasLimitKey(true),
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      depositGasLimitKey(false),
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      WITHDRAWAL_GAS_LIMIT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      SINGLE_SWAP_GAS_LIMIT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      SWAP_ORDER_GAS_LIMIT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      INCREASE_ORDER_GAS_LIMIT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      DECREASE_ORDER_GAS_LIMIT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      ESTIMATED_GAS_FEE_BASE_AMOUNT,
    ]),
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR,
    ]),
  ])

  return {
    depositSingleToken: cairoIntToBigInt(depositSingleToken),
    depositMultiToken: cairoIntToBigInt(depositMultiToken),
    withdrawalMultiToken: cairoIntToBigInt(withdrawalMultiToken),
    singleSwap: cairoIntToBigInt(singleSwap),
    swapOrder: cairoIntToBigInt(swapOrder),
    increaseOrder: cairoIntToBigInt(increaseOrder),
    decreaseOrder: cairoIntToBigInt(decreaseOrder),
    estimatedFeeBaseGasLimit: cairoIntToBigInt(estimatedFeeBaseGasLimit),
    estimatedFeeMultiplierFactor: cairoIntToBigInt(estimatedFeeMultiplierFactor),
  }
}
