import ERC20ABI from '@/abis/ERC20ABI'
import {StarknetChainId} from '@/constants/chains'
import {newContract} from '@/constants/contracts'
import {getHttpProvider} from '@/constants/rpcProviders'
import {getTokensMetadata} from '@/constants/tokens'
import cairoIntToBigInt from '@/lib/starknet/utils/cairoIntToBigInt'

export default async function getTokenBalances(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  const balanceMap = new Map<string, bigint>()

  if (!accountAddress) return balanceMap

  const provider = getHttpProvider(chainId)
  const tokens = Array.from(getTokensMetadata(chainId).values())

  await Promise.allSettled(
    tokens.map(async token => {
      const contract = newContract(ERC20ABI, token.address, provider)
      const balance = await contract.balance_of(accountAddress)
      balanceMap.set(token.address, cairoIntToBigInt(balance))
    }),
  )

  return balanceMap
}
