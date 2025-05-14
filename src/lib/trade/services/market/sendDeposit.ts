import {CairoUint256, type Call, type WalletAccount} from 'starknet'
import {
  createCall,
  createTokenContract,
  createWolfyContract,
  DepositVaultABI,
  ExchangeRouterABI,
  parseWolfyEvent,
  WolfyContract,
  WolfyEvent,
} from 'wolfy-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import type {Token} from '@/constants/tokens'

interface DepositParams {
  receiver: string
  market: string
  initialLongToken: string
  initialLongTokenAmount: bigint
  initialShortToken: string
  initialShortTokenAmount: bigint
  minMarketToken: bigint
  executionFee: bigint
  longTokenSwapPath: string[]
  shortTokenSwapPath: string[]
}

function createDepositParams(props: DepositParams) {
  /* eslint-disable camelcase -- this is the contract's naming */
  return {
    callback_contract: '0',
    callback_gas_limit: new CairoUint256(0),
    receiver: props.receiver,
    ui_fee_receiver: UI_FEE_RECEIVER_ADDRESS,
    market: props.market,
    initial_long_token: props.initialLongToken,
    initial_short_token: props.initialShortToken,
    long_token_swap_path: {snapshot: props.longTokenSwapPath},
    short_token_swap_path: {snapshot: props.shortTokenSwapPath},
    min_market_tokens: new CairoUint256(props.minMarketToken),
    execution_fee: new CairoUint256(props.executionFee),
  }
  /* eslint-enable camelcase */
}

export default async function sendDeposit(
  wallet: WalletAccount,
  props: DepositParams,
  feeToken: Token,
) {
  console.log(props)

  const params = createDepositParams(props)

  console.log(params)

  const chainId = await wallet.getChainId()

  const exchangeRouterContract = createWolfyContract(
    chainId,
    WolfyContract.ExchangeRouter,
    ExchangeRouterABI,
  )
  const depositVaultContract = createWolfyContract(
    chainId,
    WolfyContract.DepositVault,
    DepositVaultABI,
  )

  const calls: Call[] = []

  if (props.initialLongTokenAmount > 0n) {
    const longTokenContract = createTokenContract(chainId, props.initialLongToken)

    calls.push(
      createCall(longTokenContract, 'approve', [
        exchangeRouterContract.address,
        new CairoUint256(props.initialLongTokenAmount),
      ]),
    )

    calls.push(
      createCall(exchangeRouterContract, 'send_tokens', [
        longTokenContract.address,
        depositVaultContract.address,
        new CairoUint256(props.initialLongTokenAmount),
      ]),
    )
  }

  if (props.initialShortTokenAmount > 0n) {
    const shortTokenContract = createTokenContract(chainId, props.initialShortToken)

    calls.push(
      createCall(shortTokenContract, 'approve', [
        exchangeRouterContract.address,
        new CairoUint256(props.initialShortTokenAmount),
      ]),
    )

    calls.push(
      createCall(exchangeRouterContract, 'send_tokens', [
        shortTokenContract.address,
        depositVaultContract.address,
        new CairoUint256(props.initialShortTokenAmount),
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
        depositVaultContract.address,
        new CairoUint256(props.executionFee),
      ]),
    )
  }

  calls.push(createCall(exchangeRouterContract, 'create_deposit', [params]))

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    console.log(receipt.value.events)
    const depositCreatedEvent = parseWolfyEvent(WolfyEvent.DepositCreated, receipt.value.events)
    console.log(depositCreatedEvent)

    return {tx: receipt.value.transaction_hash, depositKey: depositCreatedEvent?.key}
  }
  throw new Error('Cannot deposit')
}
