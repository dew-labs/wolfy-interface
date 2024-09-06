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
      // 'https://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
      // 'https://lb.drpc.org/ogrpc?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
      'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/-xREXsAaaQDXnEY1ZQmOqhcBjnQbbvza',
      // 'https://rpc.nethermind.io/sepolia-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
      // 'https://starknet-sepolia.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
      // 'https://starknet-sepolia.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
      // -------------------------------------------------------------------------
      // 'https://starknet-sepolia.reddio.com/rpc/v0_7/rk-b244da45-a8ff-40e7-978c-76979267e390v',
      // 'https://starknet-sepolia.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
      // 'https://endpoints.omniatech.io/v1/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
      // -------------------------------------------------------------------------
      // 'https://starknet-sepolia.drpc.org',
      // 'https://free-rpc.nethermind.io/sepolia-juno',
      // 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
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
        '0x62e59aa82c0fe675f69a81a04e17df0b762486c2335c3bf0d6475b6439dfc22',
      [SatoruContract.EventEmitter]:
        '0x4e97bf347484e9fbc01622e1f67a3c6d1a2b957b92eafe3e2f167f7f7c53168',
      [SatoruContract.ReferralStorage]:
        '0xf9208f924dba6fa36212b84a4d45845ce04f45bb00e0211930a52d5077983a',
      [SatoruContract.OrderVault]:
        '0x56762a786d8d57a15d2d2d9da4dc62a245c4469184b3ab588e36716ed43aab1',
      [SatoruContract.DepositVault]:
        '0x31e1a61f54ee6d7beda440603502cdc7a661ca9a62e1cbd7a5f3255e94eb038',
      [SatoruContract.WithdrawalVault]:
        '0x300bf6441ccf1309961c93d8af91ea2e7b7c227a3a65704bc1c9f9658c3886f',
      [SatoruContract.Reader]: '0x5cdcfcb7ddb42ee731146d0a86c601ca6b0254c03ad2e2a2e88e29639b32746',
      [SatoruContract.Router]: '0x26ef9bd892195c4e29350fd4b8fdd4ef6f790c5fd7d840b82ce08c0093c44b0',
      [SatoruContract.ExchangeRouter]:
        '0x5dd9328718a26da94e057d7d184656022aac7d70c4b4aad70d0b49b4e4a2c6f',
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
