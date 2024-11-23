import {CairoUint256, type Call, type WalletAccount} from 'starknet'
import {
  createCall,
  createTokenContract,
  createWolfyContract,
  DepositVaultABI,
  ExchangeRouterABI,
  WolfyContract,
} from 'wolfy-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'

interface DepositParams {
  receiver: string
  market: string
  initialLongToken: string
  initialLongTokenAmount: bigint
  initialShortToken: string
  initialShortTokenAmount: bigint
  minMarketToken: bigint
}

function createDepositParams(props: DepositParams) {
  return {
    receiver: props.receiver,
    callback_contract: '0',
    ui_fee_receiver: UI_FEE_RECEIVER_ADDRESS,
    market: props.market,
    initial_long_token: props.initialLongToken,
    initial_short_token: props.initialShortToken,
    long_token_swap_path: {snapshot: []},
    short_token_swap_path: {snapshot: []},
    min_market_tokens: new CairoUint256(props.minMarketToken),
    execution_fee: new CairoUint256(0),
    callback_gas_limit: new CairoUint256(0),
  }
}

export default async function sendDeposit(wallet: WalletAccount, props: DepositParams) {
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
  const longTokenContract = createTokenContract(chainId, props.initialLongToken)
  const shortTokenContract = createTokenContract(chainId, props.initialShortToken)

  const calls: Call[] = []

  if (props.initialLongTokenAmount > 0n) {
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
    calls.push(createCall(exchangeRouterContract, 'create_deposit', [params]))
  }

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    console.log(receipt.events)
    const depositKey = receipt.events[6]?.data[0]
    console.log(depositKey)

    return {
      tx: receipt.transaction_hash,
    }
  } else {
    throw new Error('Cannot deposit')
  }
}
