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

export interface MarketTokenData {
  totalSupply: bigint
  decimals: number
}

export type MarketTokensData = Map<string, MarketTokenData>

export async function fetchMarketTokensData(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
): Promise<MarketTokensData> {
  const marketTokenAddressChunks = Array.from(chunkify(marketTokenAddresses, 50))

  const results = await Promise.all(
    marketTokenAddressChunks.map(async addresses => {
      const totalSupplyCalls = addresses.map(address =>
        createMulticallRequest(address, ERC20ABI, 'total_supply'),
      )

      const decimalsCalls = addresses.map(address =>
        createMulticallRequest(address, ERC20ABI, 'decimals'),
      )

      const results = await multicall(
        [...totalSupplyCalls, ...decimalsCalls],
        getWolfyContractAddress(chainId, WolfyContract.Multicall),
        getProvider(ProviderType.HTTP, chainId),
      )

      const totalSupplies = results.slice(0, results.length / 2)
      const decimals = results.slice(results.length / 2)

      return {totalSupplies, decimals, addresses}
    }),
  )

  const dataMap = new Map<string, MarketTokenData>()

  results.forEach(({totalSupplies, decimals, addresses}) => {
    totalSupplies.forEach((totalSupply, index) => {
      invariant(addresses[index])
      invariant(decimals[index])

      dataMap.set(addresses[index], {
        totalSupply: cairoIntToBigInt(totalSupply),
        decimals: Number(cairoIntToBigInt(decimals[index])),
      })
    })
  })

  return dataMap
}
