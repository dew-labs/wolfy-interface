import {
  cairoIntToBigInt,
  ERC20ABI,
  getProvider,
  ProviderType,
  type StarknetChainId,
} from 'satoru-sdk'
import {Contract} from 'starknet'

export interface MarketTokenData {
  totalSupply: bigint
  decimals: number
}

export async function fetchMarketTokensData(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
) {
  const dataMap = new Map<string, MarketTokenData>()

  const provider = getProvider(ProviderType.HTTP, chainId)

  await Promise.allSettled(
    marketTokenAddresses.map(async address => {
      const contract = new Contract(ERC20ABI, address, provider).typedv2(ERC20ABI)
      const [totalSupply, decimals] = await Promise.all([
        contract.total_supply(),
        contract.decimals(),
      ])
      dataMap.set(address, {
        totalSupply: cairoIntToBigInt(totalSupply),
        decimals: Number(cairoIntToBigInt(decimals)),
      })
    }),
  )

  return dataMap
}
