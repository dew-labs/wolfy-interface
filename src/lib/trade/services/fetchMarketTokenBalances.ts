import {Contract} from 'starknet'
import {
  cairoIntToBigInt,
  ERC20ABI,
  getProvider,
  ProviderType,
  type StarknetChainId,
} from 'wolfy-sdk'

export default async function fetchMarketTokenBalances(
  chainId: StarknetChainId,
  marketTokenAddresses: string[],
  accountAddress: string,
) {
  const balanceMap = new Map<string, bigint>()

  const provider = getProvider(ProviderType.HTTP, chainId)

  await Promise.allSettled(
    marketTokenAddresses.map(async address => {
      const contract = new Contract(ERC20ABI, address, provider).typedv2(ERC20ABI)
      const balance = await contract.balance_of(accountAddress)
      balanceMap.set(address, cairoIntToBigInt(balance))
    }),
  )

  return balanceMap
}
