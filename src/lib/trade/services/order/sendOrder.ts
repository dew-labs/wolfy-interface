import {CairoUint256, type Call, type WalletAccount} from 'starknet'
import {
  createCall,
  createTokenContract,
  createWolfyContract,
  DecreasePositionSwapType,
  ExchangeRouterABI,
  getWolfyContractAddress,
  type OrderType,
  toCairoCustomEnum,
  WolfyContract,
} from 'wolfy-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import type {Token} from '@/constants/tokens'
import {isIncreaseOrderType} from '@/lib/trade/utils/order/type/isIncreaseOrderType'

interface OrderParams {
  receiver: string
  market: string
  initialCollateralToken: string
  sizeDeltaUsd: bigint
  orderType: OrderType
  isLong: boolean
  initialCollateralDeltaAmount: bigint
  triggerPrice: bigint
  acceptablePrice: bigint
  referralCode: number
  swapPath: string[]
  executionFee: bigint
  minOutputAmount: bigint
}

function createOrderParams(props: OrderParams) {
  /* eslint-disable camelcase -- this is the contract's naming */
  return {
    callback_contract: '0',
    callback_gas_limit: new CairoUint256(0),
    ui_fee_receiver: UI_FEE_RECEIVER_ADDRESS,
    receiver: props.receiver,
    market: props.market,
    initial_collateral_token: props.initialCollateralToken,
    swap_path: {snapshot: props.swapPath},
    size_delta_usd: new CairoUint256(props.sizeDeltaUsd),
    initial_collateral_delta_amount: new CairoUint256(props.initialCollateralDeltaAmount),
    trigger_price: new CairoUint256(props.triggerPrice),
    acceptable_price: new CairoUint256(props.acceptablePrice),
    execution_fee: new CairoUint256(props.executionFee),
    // the minimum output amount for decrease orders and swaps.
    min_output_amount: new CairoUint256(props.minOutputAmount),
    order_type: toCairoCustomEnum(props.orderType),
    decrease_position_swap_type: toCairoCustomEnum(DecreasePositionSwapType.NoSwap),
    is_long: props.isLong,
    referral_code: props.referralCode,
  }
  /* eslint-enable camelcase */
}

export default async function sendOrder(
  wallet: WalletAccount,
  props: OrderParams,
  feeToken: Token,
) {
  const params = createOrderParams(props)

  console.log(params)

  const chainId = await wallet.getChainId()

  const exchangeRouterContract = createWolfyContract(
    chainId,
    WolfyContract.ExchangeRouter,
    ExchangeRouterABI,
  )
  const collateralTokenContract = createTokenContract(chainId, props.initialCollateralToken)
  const orderVaultAddress = getWolfyContractAddress(chainId, WolfyContract.OrderVault)

  const calls: Call[] = []

  if (isIncreaseOrderType(props.orderType)) {
    calls.push(
      createCall(collateralTokenContract, 'transfer', [
        orderVaultAddress,
        new CairoUint256(props.initialCollateralDeltaAmount),
      ]),
    )
  }

  if (props.executionFee > 0n) {
    const feeTokenContract = createTokenContract(chainId, feeToken.address)

    calls.push(
      createCall(feeTokenContract, 'approve', [
        exchangeRouterContract.address,
        new CairoUint256(props.executionFee),
      ]),
    )

    calls.push(
      createCall(exchangeRouterContract, 'send_tokens', [
        feeTokenContract.address,
        orderVaultAddress,
        new CairoUint256(props.executionFee),
      ]),
    )
  }

  calls.push(createCall(exchangeRouterContract, 'create_order', [params]))

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    console.log(receipt.value.events)

    // TODO: parse and get the right key
    const orderKey = receipt.value.events[1]?.data[0]
    console.log(orderKey)

    return {tx: receipt.value.transaction_hash, orderKey}
  }
  throw new Error('Cannot place order')
}
