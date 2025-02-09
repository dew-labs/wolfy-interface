import {CairoUint256, type Call, type WalletAccount} from 'starknet'
import {
  createCall,
  createTokenContract,
  createWolfyContract,
  ExchangeRouterABI,
  toStarknetHexString,
  WithdrawalVaultABI,
  WolfyContract,
} from 'wolfy-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import type {Token} from '@/constants/tokens'

interface WithdrawalParams {
  receiver: string
  market: string
  marketTokenAmount: bigint
  minLongToken: bigint
  minShortToken: bigint
  executionFee: bigint
  longTokenSwapPath: string[]
  shortTokenSwapPath: string[]
}

function createWithdrawalParams(props: WithdrawalParams) {
  /* eslint-disable camelcase -- this is the contract's naming */
  return {
    callback_contract: '0',
    callback_gas_limit: new CairoUint256(0),
    receiver: props.receiver,
    ui_fee_receiver: UI_FEE_RECEIVER_ADDRESS,
    market: props.market,
    long_token_swap_path: {snapshot: props.longTokenSwapPath},
    short_token_swap_path: {snapshot: props.shortTokenSwapPath},
    min_long_token_amount: new CairoUint256(props.minLongToken),
    min_short_token_amount: new CairoUint256(props.minShortToken),
    execution_fee: new CairoUint256(props.executionFee),
  }
  /* eslint-enable camelcase */
}

export default async function sendWithdrawal(
  wallet: WalletAccount,
  props: WithdrawalParams,
  feeToken: Token,
) {
  const params = createWithdrawalParams(props)

  console.log(params)

  const chainId = await wallet.getChainId()

  const exchangeRouterContract = createWolfyContract(
    chainId,
    WolfyContract.ExchangeRouter,
    ExchangeRouterABI,
  )
  const withdrawalVaultContract = createWolfyContract(
    chainId,
    WolfyContract.WithdrawalVault,
    WithdrawalVaultABI,
  )
  const marketTokenAddress = toStarknetHexString(props.market)
  const marketTokenContract = createTokenContract(chainId, marketTokenAddress)

  const calls: Call[] = []

  calls.push(
    createCall(marketTokenContract, 'approve', [
      props.receiver,
      new CairoUint256(props.marketTokenAmount),
    ]),
  )

  calls.push(
    createCall(marketTokenContract, 'transfer', [
      withdrawalVaultContract.address,
      new CairoUint256(props.marketTokenAmount),
    ]),
  )

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
        withdrawalVaultContract.address,
        new CairoUint256(props.executionFee),
      ]),
    )
  }

  calls.push(createCall(exchangeRouterContract, 'create_withdrawal', [params]))

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    console.log(receipt.events)
    const depositKey = receipt.events[1]?.data[0]
    console.log(depositKey)

    return {tx: receipt.transaction_hash}
  }
  throw new Error('Cannot withdrawal')
}
