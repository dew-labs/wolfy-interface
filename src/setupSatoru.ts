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
        '0x2d381da55fc89d342836b2d3bdd3d8c2ab08f0130e6c0ff33cb02a02382d7e5',
      [SatoruContract.EventEmitter]:
        '0x654fe6cd51eeee5195d5fb253d70d67140d3ae0986f10603dae22c5f41151c7',
      [SatoruContract.ReferralStorage]:
        '0x48ea140b7998e8920399e6cc7e9e92807dc9ef746a12d104f7054ea104aaeca',
      [SatoruContract.OrderVault]:
        '0x6de8e205d85fb0ab6f31d0d982cc8cc77d183e04fa94d4eb5c11ddc5a20f2ab',
      [SatoruContract.DepositVault]:
        '0x51612feaf2dd070bd6f9d50fe95bf2deaba9342298d4c1b754a4fd6dfc28daf',
      [SatoruContract.WithdrawalVault]:
        '0x2b828a4a5ee82d91a5872c72f51f0d0103fa4d5dbb06dbc1282855e8e65c243',
      [SatoruContract.Reader]: '0x6b100e189c1af605bda2b3dc26ffad0ab5163d9781ea57158e6423c4a4eea2',
      [SatoruContract.Router]: '0x5d37a0a926bf4313cb4c49fb9854c00210e40c5a61182f628eb7fe2bc85f774',
      [SatoruContract.ExchangeRouter]:
        '0x5e5f72460e15179b0770f1b3b3fb88a4e643a948002d21676f250475d24bae',
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
