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
    depositSingleToken: cairoIntToBigInt(depositSingleToken ?? 0),
    depositMultiToken: cairoIntToBigInt(depositMultiToken ?? 0),
    withdrawalMultiToken: cairoIntToBigInt(withdrawalMultiToken ?? 0),
    singleSwap: cairoIntToBigInt(singleSwap ?? 0),
    swapOrder: cairoIntToBigInt(swapOrder ?? 0),
    increaseOrder: cairoIntToBigInt(increaseOrder ?? 0),
    decreaseOrder: cairoIntToBigInt(decreaseOrder ?? 0),
    estimatedFeeBaseGasLimit: cairoIntToBigInt(estimatedFeeBaseGasLimit ?? 0),
    estimatedFeeMultiplierFactor: cairoIntToBigInt(estimatedFeeMultiplierFactor ?? 0),
  }
}
