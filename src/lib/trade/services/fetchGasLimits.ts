import {
  cairoIntToBigInt,
  createSatoruMulticallRequest,
  DataStoreABI,
  SatoruContract,
  satoruMulticall,
  type StarknetChainId,
} from 'satoru-sdk'

import {
  DECREASE_ORDER_GAS_LIMIT_KEY,
  depositGasLimitKey,
  ESTIMATED_GAS_FEE_BASE_AMOUNT_KEY,
  ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR_KEY,
  INCREASE_ORDER_GAS_LIMIT_KEY,
  SINGLE_SWAP_GAS_LIMIT_KEY,
  SWAP_ORDER_GAS_LIMIT_KEY,
  WITHDRAWAL_GAS_LIMIT_KEY,
} from '@/constants/dataStore'

export default async function fetchGasLimits(chainId: StarknetChainId) {
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
  ] = await satoruMulticall(chainId, [
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      depositGasLimitKey(true),
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      depositGasLimitKey(false),
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      WITHDRAWAL_GAS_LIMIT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      SINGLE_SWAP_GAS_LIMIT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      SWAP_ORDER_GAS_LIMIT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      INCREASE_ORDER_GAS_LIMIT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      DECREASE_ORDER_GAS_LIMIT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      ESTIMATED_GAS_FEE_BASE_AMOUNT_KEY,
    ]),
    createSatoruMulticallRequest(chainId, SatoruContract.DataStore, DataStoreABI, 'get_u256', [
      ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR_KEY,
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
