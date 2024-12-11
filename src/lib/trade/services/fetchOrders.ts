import type {StarknetChainId} from 'wolfy-sdk'
import {
  cairoIntToBigInt,
  createWolfyContract,
  createWolfyMulticallRequest,
  DataStoreABI,
  DecreasePositionSwapType,
  OrderType,
  parseCairoCustomEnum,
  ReaderABI,
  toStarknetHexString,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'

import {logError} from '@/utils/logger'

export interface Order {
  key: string
  account: string
  callbackContract: string
  initialCollateralTokenAddress: string
  marketAddress: string
  decreasePositionSwapType: DecreasePositionSwapType
  receiver: string
  swapPath: string[]
  contractAcceptablePrice: bigint
  contractTriggerPrice: bigint
  callbackGasLimit: bigint
  executionFee: bigint
  initialCollateralDeltaAmount: bigint
  minOutputAmount: bigint
  sizeDeltaUsd: bigint
  updatedAtBlock: bigint
  isFrozen: boolean
  isLong: boolean
  orderType: OrderType
}

export type OrdersData = Map<string, Order>

export default async function fetchOrders(chainId: StarknetChainId, account: string | undefined) {
  if (!account) return new Map() as OrdersData

  const dataStoreContract = createWolfyContract(chainId, WolfyContract.DataStore, DataStoreABI)
  const orderCount = await dataStoreContract.get_account_order_count(account)

  const [orderKeys, orders] = await wolfyMulticall(chainId, [
    createWolfyMulticallRequest(
      chainId,
      WolfyContract.DataStore,
      DataStoreABI,
      'get_account_order_keys',
      [account, 0, orderCount],
    ),
    createWolfyMulticallRequest(chainId, WolfyContract.Reader, ReaderABI, 'get_account_orders', [
      {
        contract_address: dataStoreContract.address,
      },
      account,
      0,
      orderCount,
    ]),
  ] as const)

  const ordersData: OrdersData = new Map()
  const length = Math.min(orderKeys.length, orders.length)

  if (orderKeys.length !== orders.length) {
    logError('get_account_order_keys & get_account_orders length mismatch')
  }

  for (let i = 0; i < length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
    const key = toStarknetHexString(orderKeys[i]!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
    const order = orders[i]!

    try {
      ordersData.set(key, {
        key,
        account: toStarknetHexString(order.account),
        receiver: toStarknetHexString(order.receiver),
        callbackContract: toStarknetHexString(order.callback_contract),
        marketAddress: toStarknetHexString(order.market),
        initialCollateralTokenAddress: toStarknetHexString(order.initial_collateral_token),
        swapPath: order.swap_path.snapshot,
        sizeDeltaUsd: cairoIntToBigInt(order.size_delta_usd),
        initialCollateralDeltaAmount: cairoIntToBigInt(order.initial_collateral_delta_amount),
        contractTriggerPrice: cairoIntToBigInt(order.trigger_price),
        contractAcceptablePrice: cairoIntToBigInt(order.acceptable_price),
        executionFee: cairoIntToBigInt(order.execution_fee),
        callbackGasLimit: cairoIntToBigInt(order.callback_gas_limit),
        minOutputAmount: cairoIntToBigInt(order.min_output_amount),
        updatedAtBlock: cairoIntToBigInt(order.updated_at_block),
        isLong: order.is_long,
        isFrozen: order.is_frozen,
        orderType: parseCairoCustomEnum(OrderType, order.order_type),
        decreasePositionSwapType: parseCairoCustomEnum(
          DecreasePositionSwapType,
          order.decrease_position_swap_type,
        ),
      })
    } catch (e) {
      logError(e, order)
    }
  }

  return ordersData
}
