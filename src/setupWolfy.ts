import {
  clearProviders,
  ProviderType,
  registerProvider,
  registerWolfyContractAddress,
  StarknetChainId,
  WolfyContract,
} from 'wolfy-sdk'

function registerHttpProviders() {
  const HTTP_RPC_PROVIDERS: Partial<Record<StarknetChainId, string[]>> = {
    [StarknetChainId.SN_MAIN]: [
      'https://api.cartridge.gg/x/starknet/mainnet',
      'https://starknet-mainnet.blastapi.io/ba2fcba1-b07c-4967-b96c-04a1a174ac17/rpc/v0_7',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/iKWI_wZKIJBEOfASy2pbaLbMAQJQat7S',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/-RKRlVd3tmxZAHYO2QbBNp6E6y7vCXXE',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/JnR9OZ0EoYZTyhz91Kko2UkLLZ1jH7Eu',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/G9wJH34O_F038b_k329lcjOd_o38JA3j',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/ekJheYMyUgzO8bxrMq0e6PCgir5WuJqK',
      'https://starknet-mainnet.blastapi.io/a419bd5a-ec9e-40a7-93a4-d16467fb79b3/rpc/v0_7',
      'https://starknet-mainnet.blastapi.io/9b95b6b2-ba0f-4fc8-b110-a87d2bda503b/rpc/v0_7',
      'https://starknet-mainnet.infura.io/v3/82802c15c3d242d2846e464a66238198',
      'https://mainnet-rpc.spaceshard.io/',
      'https://starknet-mainnet.blastapi.io/6e65b40f-7148-4714-856f-9754a74d9d5d/rpc/v0_7',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Snq-IYMCQSA2MqkyN85BljqG6-8SpM0z',
      'https://rpc.nethermind.io/mainnet-juno/?apikey=YUVMGlmfoAEUCrf9vRERnyb7YeCNFE5sA8Awf0htjD2RyKS7',
      // -------------------------------------------------------------------------
      'https://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
      'https://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      'https://starknet-mainnet.core.chainstack.com/eb9e6d5b7fd5aca63fc138fc3862fc2c',
      // 'https://lb.drpc.org/ogrpc?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/-xREXsAaaQDXnEY1ZQmOqhcBjnQbbvza',
      'https://rpc.nethermind.io/mainnet-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
      'https://starknet-mainnet.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
      'https://starknet-mainnet.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
      // -------------------------------------------------------------------------
      'https://api.zan.top/node/v1/starknet/mainnet/ad0e71cf58b14af0838cf9a75a531a0e',
      'https://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      'https://starknet.w3node.com/4e6ef792fb835d49ba525d0dc7af601a1654b70a5975817933dff40d31307766/api',
      'https://starknet-mainnet.s.chainbase.online/v1/2jD7ZRD1QSIoX1ZpatymAwGaLoz',
      'https://go.getblock.io/64d2f958da07438f949471318e27a92d',
      'https://endpoints.omniatech.io/v1/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65cv',
      'https://starknet.blockpi.network/v1/rpc/8bb365b7b96bd622eacccac88327c527c3be5b99',
      // // -------------------------------------------------------------------------
      'https://starknet-mainnet-rpc.dwellir.com',
      'https://starknet-mainnet.g.alchemy.com/v2/demo',
      // 'https://starknet.drpc.org',
      'https://starknet.blockpi.network/v1/rpc/public',
      'https://free-rpc.nethermind.io/mainnet-juno',
      'https://starknet-mainnet.public.blastapi.io/rpc/v0_7',
      // 'https://rpc.starknet.lava.build:443',
      // 'https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/f7ee0000000000000000000000000000',
    ],
    [StarknetChainId.SN_SEPOLIA]: [
      'https://api.cartridge.gg/x/starknet/sepolia',
      'https://starknet-sepolia.blastapi.io/ba2fcba1-b07c-4967-b96c-04a1a174ac17/rpc/v0_7',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/iKWI_wZKIJBEOfASy2pbaLbMAQJQat7S',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/-RKRlVd3tmxZAHYO2QbBNp6E6y7vCXXE',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/JnR9OZ0EoYZTyhz91Kko2UkLLZ1jH7Eu',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/G9wJH34O_F038b_k329lcjOd_o38JA3j',
      // 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/ekJheYMyUgzO8bxrMq0e6PCgir5WuJqK', // SEPOLIA turned off
      'https://starknet-sepolia.blastapi.io/a419bd5a-ec9e-40a7-93a4-d16467fb79b3/rpc/v0_7',
      'https://starknet-sepolia.infura.io/v3/82802c15c3d242d2846e464a66238198',
      // 'https://testnet-rpc.spaceshard.io/',
      'https://starknet-sepolia.blastapi.io/6e65b40f-7148-4714-856f-9754a74d9d5d/rpc/v0_7',
      'https://starknet-sepolia.blastapi.io/9b95b6b2-ba0f-4fc8-b110-a87d2bda503b/rpc/v0_7',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/Snq-IYMCQSA2MqkyN85BljqG6-8SpM0z',
      'https://rpc.nethermind.io/sepolia-juno/?apikey=YUVMGlmfoAEUCrf9vRERnyb7YeCNFE5sA8Awf0htjD2RyKS7',
      // -------------------------------------------------------------------------
      'https://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      // 'https://lb.drpc.org/ogrpc?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/-xREXsAaaQDXnEY1ZQmOqhcBjnQbbvza',
      'https://rpc.nethermind.io/sepolia-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
      'https://starknet-sepolia.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
      'https://starknet-sepolia.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
      // -------------------------------------------------------------------------
      'https://starknet-sepolia.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      // 'https://endpoints.omniatech.io/v1/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93', // Somehow cannot config cors
      // -------------------------------------------------------------------------
      // 'https://starknet-sepolia.drpc.org',
      'https://free-rpc.nethermind.io/sepolia-juno',
      'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
      // 'https://rpc.starknet-testnet.lava.build:443',
    ],
    [StarknetChainId.SN_KATANA]: ['https://127.0.0.1:8080'],
  }

  Object.entries(HTTP_RPC_PROVIDERS).forEach(([chainId, urls]) => {
    urls.forEach(url => {
      registerProvider(ProviderType.HTTP, chainId as StarknetChainId, url)
    })
  })
}

function registerWssProviders() {
  const WSS_RPC_PROVIDERS: Partial<Record<StarknetChainId, string[]>> = {
    [StarknetChainId.SN_MAIN]: [
      'wss://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
      // 'wss://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      'wss://starknet-mainnet.core.chainstack.com/ws/eb9e6d5b7fd5aca63fc138fc3862fc2c',
      // 'wss://lb.drpc.org/ogws?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      // -------------------------------------------------------------------------
      'wss://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      'wss://endpoints.omniatech.io/v1/ws/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65c',
      // -------------------------------------------------------------------------
      'wss://starknet-mainnet-rpc.dwellir.com',
      // 'wss://starknet.drpc.org',
    ],
    [StarknetChainId.SN_SEPOLIA]: [
      // 'wss://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952', // Unusable
      // 'wss://lb.drpc.org/ogws?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__', // Unusable
      // -------------------------------------------------------------------------
      'wss://endpoints.omniatech.io/v1/ws/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
      // -------------------------------------------------------------------------
      // 'wss://starknet-sepolia.drpc.org',
    ],
    [StarknetChainId.SN_KATANA]: [],
  }

  Object.entries(WSS_RPC_PROVIDERS).forEach(([chainId, urls]) => {
    urls.forEach(url => {
      registerProvider(ProviderType.WSS, chainId as StarknetChainId, url)
    })
  })
}

function registerContractAddresses() {
  const CONTRACT_ADDRESSES: Partial<
    Record<StarknetChainId, Partial<Record<WolfyContract, string>>>
  > = {
    [StarknetChainId.SN_SEPOLIA]: {
      [WolfyContract.Multicall]:
        '0x062e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
      [WolfyContract.Reader]: '0x2941ae49e308eab801a0f7942837d117a41c15e0e273f97ae0ad2eb65e31fc9',
      [WolfyContract.EventEmitter]:
        '0x6bd9bbce44c7e0a52225f723a623f59ae960608e40957d9e83eace4114afb9',
      [WolfyContract.Router]: '0x3b9dfe3f0c3d1150af8f659f544948c3298228a3fd743020fe8640f76b29384',
      [WolfyContract.ReferralStorage]:
        '0x61b8570a75a020cd6b07352ad18e663526194cc166f94fbb7d955aac89ab62c',
      [WolfyContract.DataStore]:
        '0x411aee1bebd02751044e28062c0b87bdc172bdb7080aebe1f3d6b7679452443',
      [WolfyContract.OrderVault]:
        '0x18c6c77430e03c54b23108c26735ce449c75baa8d0c313837341f6c18b80d2b',
      [WolfyContract.DepositVault]:
        '0x7941e5ecfd5562c8d749a708a23063f0e94eeeb8dc7a9e11a592ce8b3890f54',
      [WolfyContract.WithdrawalVault]:
        '0x706f2af7b558e221703d83dd55ad7df0eb106fb8847aa9276777efbf180d50f',
      [WolfyContract.ExchangeRouter]:
        '0x731be42ea0b72a50644e72e48e93238675cd37a3aa8d20d26fe37a7a25c765c',
    },
    // [StarknetChainId.SN_SEPOLIA]: {
    //   [WolfyContract.Multicall]:
    //     '0x062e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
    //   [WolfyContract.Reader]: '0x3be559b429d6ede49c660c27fe800322dd51a8e0b1088d93b1fc05fc7f30247',
    //   [WolfyContract.EventEmitter]:
    //     '0x36e20d5ea2e457cc7f68dad32904873a3f595f05f6444341281920455a21688',
    //   [WolfyContract.Router]: '0x32e01927628df34b2018fa4e891770704553053b0e98f738eae21f210b12000',
    //   [WolfyContract.ReferralStorage]:
    //     '0x73a58f3b492401c6bd7cb8658f6aabfa7e2b814e5011ff7a80a33dda6547f06',
    //   [WolfyContract.DataStore]: '0xb55e56b59a632d4d4648b207d972e9f3284e9cae3da63c96800109955bc0bd',
    //   [WolfyContract.OrderVault]:
    //     '0x62b5d0da14d863a466fc74f53336ebdceedbcdd02e166671105fb9172c7cc9b',
    //   [WolfyContract.DepositVault]:
    //     '0x55cb850dc97ecf71e60d2b8c9c1ef3cbf875c56c55133f86a1e2011b401d370',
    //   [WolfyContract.WithdrawalVault]:
    //     '0x3b444f14d9cde9eef02250d7dab635269c75056a824ab4cc211960163c31e1a',
    //   [WolfyContract.ExchangeRouter]:
    //     '0x7583497845a3159f30a799f7d74f46cf16baae16bcc4c5973c65f71af651bad',
    // },
    // Not available
    [StarknetChainId.SN_MAIN]: {
      [WolfyContract.Multicall]:
        '0x062e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
    },
    // Note: this will always change
    [StarknetChainId.SN_KATANA]: {
      [WolfyContract.Multicall]:
        '0x203e20476da9d6147d506d46b568bf217bae5bb8f65b31755da3da4358cb68c',
      [WolfyContract.Reader]: '0x17a7f571b793477ba195be08661f9f72a2691792cd08e9679c3efa629497ca2',
      [WolfyContract.EventEmitter]:
        '0x207a233bc2cf39a127a152344c0fe6a1b5b6a808db767bc9b75b519252ab0d0',
      [WolfyContract.Router]: '0x7c43781bb9da29ae279ff399d0a048c3df4a4d60f558a5a59906a369692990e',
      [WolfyContract.ReferralStorage]:
        '0x112949c63bc01ddc8f53f7cc626f794387b2b4898a82843eb9c2527d5b414ca',
      [WolfyContract.DataStore]:
        '0x34d8b2b6fa67e3d519fa1466d47a86468481da639d6f5de1bd64e7e40852f67',
      [WolfyContract.OrderVault]:
        '0x71d39a703e94aa13b5a851182abbe4e56d617140af067f6234315ba42b74e23',
      [WolfyContract.DepositVault]:
        '0x5a7d3688afa8c10d68523a93f7a8e2ab5535cb2c52c1be2867409cbcac3199e',
      [WolfyContract.WithdrawalVault]:
        '0x44062427ac689a16a27bfcf8e73d70227f2897b3b23a3b4613f045005d93221',
      [WolfyContract.ExchangeRouter]:
        '0x3606041a6a483ae3464036403ab211fdf280a0c43536e15df196c9178664aa4',
    },
  }

  Object.entries(CONTRACT_ADDRESSES).forEach(([chainId, contracts]) => {
    Object.entries(contracts).forEach(([contract, address]) => {
      registerWolfyContractAddress(
        chainId as StarknetChainId,
        contract as unknown as WolfyContract,
        address,
      )
    })
  })
}

export function setupWolfy() {
  registerContractAddresses()
  registerHttpProviders()
  registerWssProviders()
}

export function teardownWolfy() {
  clearProviders(ProviderType.HTTP, StarknetChainId.SN_SEPOLIA)
  clearProviders(ProviderType.HTTP, StarknetChainId.SN_MAIN)
  clearProviders(ProviderType.HTTP, StarknetChainId.SN_KATANA)
  clearProviders(ProviderType.WSS, StarknetChainId.SN_SEPOLIA)
  clearProviders(ProviderType.WSS, StarknetChainId.SN_MAIN)
  clearProviders(ProviderType.WSS, StarknetChainId.SN_KATANA)
}
