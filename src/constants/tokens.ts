import {StarknetChainId} from './chains'

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
        '0x06c91e45243196580079bb9287555b4c3abe453fc54b98176c8cda9758b29504',
        {
          name: 'Satoru Market Token',
          symbol: 'GM',
          decimals: 18,
          address: '0x06c91e45243196580079bb9287555b4c3abe453fc54b98176c8cda9758b29504',
          imageUrl: 'https://assets.coingecko.com/coins/images/35903/standard/ballz-logo.png',
        },
      ],
      [
        '0x042c1a16c9cd00af9ea4a42e70776abc43f3d9583c2f259115df6e33a5e1baab',
        {
          name: 'zETH',
          symbol: 'zETH',
          decimals: 18,
          address: '0x042c1a16c9cd00af9ea4a42e70776abc43f3d9583c2f259115df6e33a5e1baab',
          imageUrl: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/eth',
        },
      ],
      [
        '0x06f20e6aec861fbfe738dc9b639832ff449a5ce762cbcfbe84132561cab49e54',
        {
          name: 'USDC',
          symbol: 'USDC',
          decimals: 18,
          address: '0x06f20e6aec861fbfe738dc9b639832ff449a5ce762cbcfbe84132561cab49e54',
          imageUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdc',
        },
      ],
      [
        '0x020e9f2751212c9858219250e875ce6ac02aba3d45bff8262f5f0f0a1cf1aee0',
        {
          name: 'wETH',
          symbol: 'wETH',
          decimals: 18,
          address: '0x020e9f2751212c9858219250e875ce6ac02aba3d45bff8262f5f0f0a1cf1aee0',
          imageUrl: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/eth',
        },
      ],
      [
        '0x026c9f97a5e7ae83320675f691457fbf5222366da33df5f2a0c7b77c28529ef3',
        {
          name: 'Satoru Market Token',
          symbol: 'GM',
          decimals: 18,
          address: '0x026c9f97a5e7ae83320675f691457fbf5222366da33df5f2a0c7b77c28529ef3',
          imageUrl: 'https://assets.coingecko.com/coins/images/35903/standard/ballz-logo.png',
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
