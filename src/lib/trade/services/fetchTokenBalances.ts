import {createMulticallRequest, multicall} from 'starknet_multicall'
import invariant from 'tiny-invariant'
import {
  cairoIntToBigInt,
  ERC20ABI,
  getProvider,
  getWolfyContractAddress,
  ProviderType,
  StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

import {getTokensMetadata} from '@/constants/tokens'
import chunkify from '@/utils/chunkify'

export type TokenBalancesData = Map<string, bigint>

export default async function getTokenBalances(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
): Promise<TokenBalancesData> {
  const balanceMap = new Map<string, bigint>()

  if (!accountAddress) return balanceMap

  const tokens = Array.from(getTokensMetadata(chainId).values())

  const tokenChunks = Array.from(chunkify(tokens, 50))

  const results = await Promise.all(
    tokenChunks.map(async tokens => {
      const calls = tokens.map(token =>
        createMulticallRequest(token.address, ERC20ABI, 'balance_of', [accountAddress]),
      )

      const balances = await multicall(
        calls,
        getWolfyContractAddress(chainId, WolfyContract.Multicall),
        getProvider(ProviderType.HTTP, chainId),
      )

      return {
        balances,
        tokens,
      }
    }),
  )

  results.forEach(({balances, tokens}) => {
    balances.forEach((balance, index) => {
      invariant(tokens[index])
      balanceMap.set(tokens[index].address, cairoIntToBigInt(balance))
    })
  })

  return balanceMap
}
