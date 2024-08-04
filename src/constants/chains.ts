import {constants} from 'starknet'

export const StarknetChainId = constants.StarknetChainId
export type StarknetChainId = constants.StarknetChainId

export const DEFAULT_CHAIN_ID = constants.StarknetChainId.SN_SEPOLIA

export const SUPPORTED_CHAINS: {
  chainId: StarknetChainId
  name: string
}[] = [
  {
    chainId: StarknetChainId.SN_MAIN,
    name: 'Mainnet',
  },
  {
    chainId: StarknetChainId.SN_SEPOLIA,
    name: 'Sepolia',
  },
] as const

export const SUPPORTED_CHAIN_IDS = [StarknetChainId.SN_SEPOLIA] as const

export function isChainIdSupported(
  chainId: unknown,
): chainId is (typeof SUPPORTED_CHAIN_IDS)[number] {
  return SUPPORTED_CHAIN_IDS.includes(chainId as StarknetChainId)
}
