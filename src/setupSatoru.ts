import {
  ProviderType,
  registerProvider,
  registerSatoruContractAddress,
  SatoruContract,
  StarknetChainId,
} from 'satoru-sdk'

function registerHttpProviders() {
  const HTTP_RPC_PROVIDERS: Record<StarknetChainId, string[]> = {
    [StarknetChainId.SN_MAIN]: [
      'https://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
      'https://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      'https://starknet-mainnet.core.chainstack.com/eb9e6d5b7fd5aca63fc138fc3862fc2c',
      // 'https://lb.drpc.org/ogrpc?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/-xREXsAaaQDXnEY1ZQmOqhcBjnQbbvza',
      'https://rpc.nethermind.io/mainnet-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
      'https://starknet-mainnet.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
      'https://starknet-mainnet.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
      // -------------------------------------------------------------------------
      // 'https://starknet-mainnet.reddio.com/rpc/v0_7/rk-b244da45-a8ff-40e7-978c-76979267e390',
      'https://api.zan.top/node/v1/starknet/mainnet/ad0e71cf58b14af0838cf9a75a531a0e',
      'https://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      'https://starknet.w3node.com/4e6ef792fb835d49ba525d0dc7af601a1654b70a5975817933dff40d31307766/api',
      'https://starknet-mainnet.s.chainbase.online/v1/2jD7ZRD1QSIoX1ZpatymAwGaLoz',
      'https://go.getblock.io/64d2f958da07438f949471318e27a92d',
      'https://endpoints.omniatech.io/v1/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65cv',
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
      'https://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      // 'https://lb.drpc.org/ogrpc?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/-xREXsAaaQDXnEY1ZQmOqhcBjnQbbvza',
      'https://rpc.nethermind.io/sepolia-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
      'https://starknet-sepolia.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
      'https://starknet-sepolia.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
      // -------------------------------------------------------------------------
      // 'https://starknet-sepolia.reddio.com/rpc/v0_7/rk-b244da45-a8ff-40e7-978c-76979267e390v',
      // 'https://starknet-sepolia.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      'https://endpoints.omniatech.io/v1/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
      // -------------------------------------------------------------------------
      // 'https://starknet-sepolia.drpc.org',
      'https://free-rpc.nethermind.io/sepolia-juno',
      'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
      // 'https://rpc.starknet-testnet.lava.build:443',
    ],
  }

  Object.entries(HTTP_RPC_PROVIDERS).forEach(([chainId, urls]) => {
    urls.forEach(url => {
      registerProvider(ProviderType.HTTP, chainId as StarknetChainId, url)
    })
  })
}

function registerWssProviders() {
  const WSS_RPC_PROVIDERS: Record<StarknetChainId, string[]> = {
    [StarknetChainId.SN_MAIN]: [
      'wss://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
      'wss://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      'wss://starknet-mainnet.core.chainstack.com/ws/eb9e6d5b7fd5aca63fc138fc3862fc2c',
      'wss://lb.drpc.org/ogws?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      // // -------------------------------------------------------------------------
      'wss://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      'wss://endpoints.omniatech.io/v1/ws/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65c',
      // // -------------------------------------------------------------------------
      'wss://starknet-mainnet-rpc.dwellir.com',
      'wss://starknet.drpc.org',
    ],
    [StarknetChainId.SN_SEPOLIA]: [
      // 'wss://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952', // Unusable
      // 'wss://lb.drpc.org/ogws?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__', // Unusable
      // // -------------------------------------------------------------------------
      'wss://endpoints.omniatech.io/v1/ws/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
      // // -------------------------------------------------------------------------
      // 'wss://starknet-sepolia.drpc.org',
    ],
  }

  Object.entries(WSS_RPC_PROVIDERS).forEach(([chainId, urls]) => {
    urls.forEach(url => {
      registerProvider(ProviderType.WSS, chainId as StarknetChainId, url)
    })
  })
}

function registerContractAddresses() {
  const CONTRACT_ADDRESSES: Record<StarknetChainId, Partial<Record<SatoruContract, string>>> = {
    [StarknetChainId.SN_SEPOLIA]: {
      [SatoruContract.Multicall]:
        '0x062e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
      [SatoruContract.DataStore]:
        '0x3d9d07e2ecb37362660cc8b5a0b1c78af3ce1b7d3fde786bab64ee95f2cbbd5',
      [SatoruContract.EventEmitter]:
        '0x218d55d9fc608cc146bd084f0c040b54ad0c222e459166008f66d7cd326112e',
      [SatoruContract.ReferralStorage]:
        '0x453942b76b775ebc5bd6c36cf7dc8810ec1ae0e5fedf4b18d59effe04215d24',
      [SatoruContract.OrderVault]:
        '0x676de0d2733ae31dc03cc828963beef3bce099121ec0e4aec18aacfbb2bdafc',
      [SatoruContract.DepositVault]:
        '0x76d828603031368c5e568df39a97b995c62fcb0c85297acf7213825770ddb55',
      [SatoruContract.WithdrawalVault]:
        '0x69b9395bb48e2d2eb26abfa75635ca52ee7795d28b99133ab4ddede50d78755',
      [SatoruContract.Reader]: '0x53f9007bdc8a48d0b53741cdc01b65b1475aa6db0083578155dedc63b64f7bc',
      [SatoruContract.Router]: '0x1ce688663a3a3dcf016e379ba1fb2e3adf4bbda7e3185e5fdfd213de292d7f1',
      [SatoruContract.ExchangeRouter]:
        '0x745c393d796ecc68afed3247d8dd8be8b4280507b3601289e3d2b4a1a680b39',
    },
    // Not available
    [StarknetChainId.SN_MAIN]: {
      [SatoruContract.Multicall]:
        '0x062e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
    },
  }

  Object.entries(CONTRACT_ADDRESSES).forEach(([chainId, contracts]) => {
    Object.entries(contracts).forEach(([contract, address]) => {
      registerSatoruContractAddress(
        chainId as StarknetChainId,
        contract as unknown as SatoruContract,
        address,
      )
    })
  })
}

function setupSatoru() {
  registerContractAddresses()
  registerHttpProviders()
  registerWssProviders()
}

setupSatoru()
