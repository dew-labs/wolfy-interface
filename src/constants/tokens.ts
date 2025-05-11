import {StarknetChainId} from 'wolfy-sdk'

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
  pythFeedId?: string
}

export const MOCK_SYMBOL_MAP: Record<string, string> = {wfETH: 'eth', wfBTC: 'btc', wfSTRK: 'strk'}

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
        '0x07d2da5ff2548727ecdc1c2ec8c9c3b552cbe7a9800abc1f69579e75c01b90a5',
        {
          name: 'Dew USD',
          symbol: 'DUSD',
          decimals: 18,
          address: '0x07d2da5ff2548727ecdc1c2ec8c9c3b552cbe7a9800abc1f69579e75c01b90a5',
          priceDecimals: 18,
          imageUrl: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdt',
          pythFeedId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
        },
      ],
      [
        '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
        {
          name: 'Wolfy USD',
          symbol: 'wfUSD',
          decimals: 18,
          address: '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
          priceDecimals: 18,
          imageUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdc',
          pythFeedId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
        },
      ],
      [
        '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
        {
          name: 'Wolfy ETH',
          symbol: 'wfETH',
          decimals: 18,
          address: '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
          priceDecimals: 18,
          imageUrl: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/eth',
          pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
        },
      ],
      [
        '0x0257f31f11fa095874ded95a8ad6c8dca9fb851557df83e7cd384bde65c4d1c4',
        {
          name: 'Wolfy Starknet',
          symbol: 'wfSTRK',
          decimals: 18,
          address: '0x0257f31f11fa095874ded95a8ad6c8dca9fb851557df83e7cd384bde65c4d1c4',
          priceDecimals: 18,
          imageUrl: 'https://assets.coingecko.com/coins/images/26433/standard/starknet.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/strk',
          pythFeedId: '0x6a182399ff70ccf3e06024898942028204125a819e519a335ffa4579e66cd870',
        },
      ],
      [
        '0x07e3b6dce9c3b052e96a63d63f26aa129a1c5342343a7bb9a20754812bf4e614',
        {
          name: 'Wolfy Bitcoin',
          symbol: 'wfBTC',
          decimals: 8,
          address: '0x07e3b6dce9c3b052e96a63d63f26aa129a1c5342343a7bb9a20754812bf4e614',
          priceDecimals: 18,
          imageUrl: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/btc',
          pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
        },
      ],
    ]),
  ],
  [
    StarknetChainId.SN_KATANA,
    new Map([
      [
        '0x07a0516a4258b386cbfde64d0429d3430c7714eee79caad5c2934c645b49d303',
        {
          address: '0x07a0516a4258b386cbfde64d0429d3430c7714eee79caad5c2934c645b49d303',
          name: 'Wolfy USD',
          symbol: 'wfUSD',
          decimals: 18,
          priceDecimals: 18,
          owner: '0x0127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
          pythFeedId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
          imageUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdc',
        },
      ],
      [
        '0x03bca85a90ade9936e9babf7bc4519bdd1aa63805eb6214cc83a95709c9aa838',
        {
          address: '0x03bca85a90ade9936e9babf7bc4519bdd1aa63805eb6214cc83a95709c9aa838',
          name: 'Dew USD',
          symbol: 'DUSD',
          decimals: 18,
          priceDecimals: 18,
          owner: '0x0127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
          pythFeedId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
          imageUrl: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/usdt',
        },
      ],
      [
        '0x060daff2e4fbf2a789baa16c01f14733434fb32aa1db9558e9944ad154fa42b2',
        {
          address: '0x060daff2e4fbf2a789baa16c01f14733434fb32aa1db9558e9944ad154fa42b2',
          name: 'Wolfy Ethereum',
          symbol: 'wfETH',
          decimals: 18,
          priceDecimals: 18,
          owner: '0x0127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
          pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
          imageUrl: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/eth',
        },
      ],
      [
        '0x03a2f645ca6481b92c0268d01a52b57a9d06e7ec61d66c069f084bab23a43996',
        {
          address: '0x03a2f645ca6481b92c0268d01a52b57a9d06e7ec61d66c069f084bab23a43996',
          name: 'Wolfy Starknet',
          symbol: 'wfSTRK',
          decimals: 18,
          priceDecimals: 18,
          owner: '0x0127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
          pythFeedId: '0x6a182399ff70ccf3e06024898942028204125a819e519a335ffa4579e66cd870',
          imageUrl: 'https://assets.coingecko.com/coins/images/26433/standard/starknet.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/strk',
        },
      ],
      [
        '0x000cc2f2cb71fb19d8f54731ad65ae5477bb9bdd15a7f5a1331c395240c34a48',
        {
          address: '0x000cc2f2cb71fb19d8f54731ad65ae5477bb9bdd15a7f5a1331c395240c34a48',
          name: 'Wolfy Bitcoin',
          symbol: 'wfBTC',
          decimals: 8,
          priceDecimals: 18,
          owner: '0x0127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec',
          pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
          imageUrl: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
          coingeckoUrl: 'https://www.coingecko.com/en/coins/btc',
        },
      ],
    ]),
  ],
])

// TODO: support change fee token
// NOTE: must follow contractconfig
export const FEE_TOKEN_ADDRESS = new Map<StarknetChainId, string>([
  [StarknetChainId.SN_KATANA, '0x060daff2e4fbf2a789baa16c01f14733434fb32aa1db9558e9944ad154fa42b2'], // wfETH
  [
    StarknetChainId.SN_SEPOLIA,
    '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
  ], // wfETH
  // [StarknetChainId.SN_MAIN, ''],
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
