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

interface WithdrawalParams {
  receiver: string
  market: string
  marketTokenAmount: bigint
  minLongToken: bigint
  minShortToken: bigint
}

function createWithdrawalParams(props: WithdrawalParams) {
  return {
    receiver: props.receiver,
    callback_contract: '0',
    ui_fee_receiver: UI_FEE_RECEIVER_ADDRESS,
    market: props.market,
    long_token_swap_path: {snapshot: []},
    short_token_swap_path: {snapshot: []},
    min_long_token_amount: new CairoUint256(props.minLongToken),
    min_short_token_amount: new CairoUint256(props.minShortToken),
    execution_fee: new CairoUint256(0),
    callback_gas_limit: new CairoUint256(0),
  }
}

export default async function sendWithdrawal(wallet: WalletAccount, props: WithdrawalParams) {
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
  calls.push(createCall(exchangeRouterContract, 'create_withdrawal', [params]))

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    console.log(receipt.events)
    const depositKey = receipt.events[1]?.data[0]
    console.log(depositKey)

    return {
      tx: receipt.transaction_hash,
    }
  } else {
    throw new Error('Cannot deposit')
  }
}
