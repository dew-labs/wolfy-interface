import {StarknetChainId} from 'satoru-sdk'

export const DEFAULT_CHAIN_ID = StarknetChainId.SN_SEPOLIA

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

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(chain => chain.chainId)

export function isChainIdSupported(chainId: unknown): chainId is StarknetChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as StarknetChainId)
}
