import {StarknetChainId} from 'satoru-sdk'

export interface Token {
  name: string
  symbol: string
  assetSymbol?: string
  baseSymbol?: string
  decimals: number
  address: string
  priceDecimals?: number
  coingeckoUrl?: string
  coingeckoSymbol?: string
  explorerUrl?: string
  reservesUrl?: string
  imageUrl?: string
}

const TOKENS_METADATA = new Map<StarknetChainId, Map<string, Token>>([
  [StarknetChainId.SN_MAIN, new Map()],
  [
    StarknetChainId.SN_SEPOLIA,
    new Map([
      // {
      //   name: 'ETH',
      //   symbol: 'ETH',
      //   decimals: 18,
      //   address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      //   imageUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      // },
      // {
      //   name: 'Wrapped liquid staked Ether 2.0',
      //   symbol: 'wstETH',
      //   decimals: 18,
      //   address: '0x0335bc6e1cf6d9527da4f8044c505906ad6728aeeddfba8d7000b01b32ffe66b',
      //   imageUrl: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
      //   coingeckoUrl: 'https://www.coingecko.com/en/coins/wrapped-steth',
      // },
      // {
      //   name: 'StarkGate: STRK Token',
      //   symbol: 'STRK',
      //   decimals: 18,
      //   address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      //   imageUrl: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
      //   coingeckoUrl: 'https://www.coingecko.com/en/coins/wrapped-steth',
      // },
      [
        '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
        {
          name: 'Wolfy ETH',
          symbol: 'wfETH',
          decimals: 18,
          address: '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',

          imageUrl: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/eth',
        },
      ],
      [
        '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
        {
          name: 'Wolfy USD',
          symbol: 'wfUSD',
          decimals: 18,
          address: '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
          imageUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdc',
        },
      ],
    ]),
  ],
])

export function getTokenMetadata(chainId: StarknetChainId, address: string) {
  const tokenMetadata = TOKENS_METADATA.get(chainId)?.get(address)

  if (!tokenMetadata) {
    throw new Error(`Token address "${String(address)}" for chainId ${chainId} is not supported`)
  }

  return tokenMetadata
}

export function getTokensMetadata(chainId: StarknetChainId) {
  const tokensMetadata = TOKENS_METADATA.get(chainId)

  if (!tokensMetadata) {
    throw new Error(`ChainId "${chainId}" is not supported`)
  }

  return tokensMetadata
}
