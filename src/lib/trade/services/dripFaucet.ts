import {type Call, type WalletAccount} from 'starknet'
import {createCall, createTokenContract} from 'wolfy-sdk'

import {getTokensMetadata} from '@/constants/tokens'
import expandDecimals from '@/utils/numbers/expandDecimals'

export default async function dripFaucet(wallet: WalletAccount) {
  const chainId = await wallet.getChainId()

  const tokens = getTokensMetadata(chainId)

  for (const token of tokens) {
    await wallet.watchAsset({
      type: 'ERC20',
      options: {
        address: token[1].address,
      },
    })
  }

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
