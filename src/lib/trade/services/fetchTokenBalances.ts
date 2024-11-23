import {Contract} from 'starknet'
import {cairoIntToBigInt, ERC20ABI, getProvider, ProviderType, StarknetChainId} from 'wolfy-sdk'

import {getTokensMetadata} from '@/constants/tokens'

export default async function getTokenBalances(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  const balanceMap = new Map<string, bigint>()

  if (!accountAddress) return balanceMap

  const provider = getProvider(ProviderType.HTTP, chainId)
  const tokens = Array.from(getTokensMetadata(chainId).values())

  await Promise.allSettled(
    tokens.map(async token => {
      const contract = new Contract(ERC20ABI, token.address, provider).typedv2(ERC20ABI)
      const balance = await contract.balance_of(accountAddress)
      balanceMap.set(token.address, cairoIntToBigInt(balance))
    }),
  )

  return balanceMap
}
