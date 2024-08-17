import {
  createCall,
  createSatoruContract,
  ExchangeRouterABI,
  executeAndWait,
  SatoruContract,
  StarknetChainId,
} from 'satoru-sdk'
import type {Account} from 'starknet'

export default async function cancelOrder(
  chainId: StarknetChainId,
  account: Account,
  orderKey: string,
) {
  const exchangeRouterContract = createSatoruContract(
    chainId,
    SatoruContract.ExchangeRouter,
    ExchangeRouterABI,
  )

  const receipt = await executeAndWait(
    account,
    createCall(exchangeRouterContract, 'cancel_order', [orderKey]),
  )

  if (receipt.isSuccess()) {
    return {
      tx: receipt.transaction_hash,
    }
  } else {
    throw new Error('Cannot cancel order')
  }
}
