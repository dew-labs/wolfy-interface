import {createMulticallRequest, multicall} from 'starknet_multicall'
import invariant from 'tiny-invariant'
import {
  cairoIntToBigInt,
  ERC20ABI,
  getProvider,
  getWolfyContractAddress,
  ProviderType,
  type StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

import chunkify from '@/utils/chunkify'

export default async function fetchMarketTokenBalances(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
  accountAddress: string | undefined,
) {
  const balanceMap = new Map<string, bigint>()

  if (!accountAddress) return balanceMap

  const marketTokenAddressChunks = Array.from(chunkify(marketTokenAddresses, 50))

  const results = await Promise.all(
    marketTokenAddressChunks.map(async addresses => {
      const calls = addresses.map(address =>
        createMulticallRequest(address, ERC20ABI, 'balance_of', [accountAddress]),
      )

      return {
        balances: await multicall(
          calls,
          getWolfyContractAddress(chainId, WolfyContract.Multicall),
          getProvider(ProviderType.HTTP, chainId),
        ),
        addresses,
      }
    }),
  )

  results.forEach(({balances, addresses}) => {
    balances.forEach((balance, index) => {
      invariant(addresses[index])
      balanceMap.set(addresses[index], cairoIntToBigInt(balance))
    })
  })

  return balanceMap
}
