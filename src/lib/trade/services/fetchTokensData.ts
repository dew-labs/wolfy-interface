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

interface TokenData {
  totalSupply: bigint
  decimals: number
}

export type TokensData = Map<string, TokenData>

export async function fetchTokensData(
  chainId: StarknetChainId,
  tokenAddresses: string[],
): Promise<TokensData> {
  const dataMap = new Map<string, TokenData>()

  const tokenAddressChunks = Array.from(chunkify(tokenAddresses, 50))

  const results = await Promise.all(
    tokenAddressChunks.map(async addresses => {
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

      const totalSupplies = results.slice(0, addresses.length)
      const decimals = results.slice(addresses.length)

      return {addresses, totalSupplies, decimals}
    }),
  )

  results.forEach(({addresses, totalSupplies, decimals}) => {
    addresses.forEach((address, index) => {
      invariant(address)
      invariant(totalSupplies[index])
      invariant(decimals[index])

      dataMap.set(address, {
        totalSupply: cairoIntToBigInt(totalSupplies[index]),
        decimals: Number(cairoIntToBigInt(decimals[index])),
      })
    })
  })

  return dataMap
}
