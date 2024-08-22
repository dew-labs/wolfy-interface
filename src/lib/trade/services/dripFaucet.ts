import {createCall, createTokenContract} from 'satoru-sdk'
import type {Call, WalletAccount} from 'starknet'

import {getTokensMetadata} from '@/constants/tokens'
import expandDecimals from '@/utils/numbers/expandDecimals'

export default async function dripFaucet(wallet: WalletAccount) {
  const chainId = await wallet.getChainId()

  // TODO: add asset to wallet
  // wallet.watchAsset({

  // })

  const tokens = getTokensMetadata(chainId)

  const calls: Call[] = []

  tokens.forEach(token => {
    const tokenContract = createTokenContract(chainId, token.address)
    calls.push(
      createCall(tokenContract, 'mint', [wallet.address, expandDecimals(10, token.decimals + 5)]),
    )
  })

  const result = await wallet.execute(calls)

  const receipt = await wallet.waitForTransaction(result.transaction_hash)

  if (receipt.isSuccess()) {
    return {
      tx: receipt.transaction_hash,
    }
  } else {
    throw new Error('Cannot drip faucet')
  }
}
