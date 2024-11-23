import {Contract} from 'starknet'
import {cairoIntToBigInt, ERC20ABI, getProvider, ProviderType, StarknetChainId} from 'wolfy-sdk'

interface TokenData {
  balance: bigint
  totalSupply: bigint
  decimals: number
}

export async function fetchTokensData(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  tokenAddresses: string[],
) {
  const dataMap = new Map<string, TokenData>()

  const provider = getProvider(ProviderType.HTTP, chainId)

  await Promise.allSettled(
    tokenAddresses.map(async address => {
      const contract = new Contract(ERC20ABI, address, provider).typedv2(ERC20ABI)
      const [balance, totalSupply, decimals] = await Promise.all([
        accountAddress ? contract.balance_of(accountAddress) : Promise.resolve(0n),
        contract.total_supply(),
        contract.decimals(),
      ])

      dataMap.set(address, {
        balance: cairoIntToBigInt(balance),
        totalSupply: cairoIntToBigInt(totalSupply),
        decimals: Number(cairoIntToBigInt(decimals)),
      })
    }),
  )
}
