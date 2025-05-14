import type {Account} from 'starknet'
import {
  createCall,
  createWolfyContract,
  ExchangeRouterABI,
  executeAndWait,
  StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

export default async function cancelOrder(
  chainId: StarknetChainId,
  account: Account,
  orderKey: string,
) {
  const exchangeRouterContract = createWolfyContract(
    chainId,
    WolfyContract.ExchangeRouter,
    ExchangeRouterABI,
  )

  const receipt = await executeAndWait(
    account,
    createCall(exchangeRouterContract, 'cancel_order', [orderKey]),
  )

  if (receipt.isSuccess()) {
    return {tx: receipt.value.transaction_hash}
  }
  throw new Error('Cannot cancel order')
}
