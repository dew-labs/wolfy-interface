import {sample} from 'remeda'
import {RpcProvider} from 'starknet'

import {StarknetChainId} from './chains'

export const HTTP_RPC_PROVIDERS: Record<StarknetChainId, string[]> = {
  [StarknetChainId.SN_MAIN]: [
    'https://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
    'https://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
    'https://starknet-mainnet.core.chainstack.com/eb9e6d5b7fd5aca63fc138fc3862fc2c',
    'https://lb.drpc.org/ogrpc?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
    'https://free-rpc.nethermind.io/mainnet-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
    'https://starknet-mainnet.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
    'https://starknet-mainnet.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
    // -------------------------------------------------------------------------
    // 'https://starknet-mainnet.reddio.com/rpc/v0_7/rk-b244da45-a8ff-40e7-978c-76979267e390',
    // 'https://api.zan.top/node/v1/starknet/mainnet/ad0e71cf58b14af0838cf9a75a531a0e',
    // 'https://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
    // 'https://starknet.w3node.com/4e6ef792fb835d49ba525d0dc7af601a1654b70a5975817933dff40d31307766/api',
    // 'https://starknet-mainnet.s.chainbase.online/v1/2jD7ZRD1QSIoX1ZpatymAwGaLoz',
    // 'https://go.getblock.io/64d2f958da07438f949471318e27a92d',
    // 'https://endpoints.omniatech.io/v1/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65cv',
    // // -------------------------------------------------------------------------
    // 'https://starknet-mainnet-rpc.dwellir.com',
    // 'https://starknet-mainnet.g.alchemy.com/v2/demo',
    // 'https://starknet.drpc.org',
    // 'https://starknet.blockpi.network/v1/rpc/public',
    // 'https://free-rpc.nethermind.io/mainnet-juno',
    // 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7',
    // 'https://rpc.starknet.lava.build:443',
    // 'https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/f7ee0000000000000000000000000000',
  ],
  [StarknetChainId.SN_SEPOLIA]: [
    'https://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
    'https://lb.drpc.org/ogrpc?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
    'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/SMOBrqazCx_UNfMy8HsLlXWOF8o5bHI-',
    'https://free-rpc.nethermind.io/sepolia-juno/?apikey=5v9T3rXRGAeZz446aA7GjxCneADe2vZ3N9HdotFQH4DQBIM3',
    'https://starknet-sepolia.blastapi.io/e38e0729-e402-4759-b0d1-dce28898f3ff/rpc/v0_7',
    'https://starknet-sepolia.infura.io/v3/2106130ac5734a04b3b1db1588ee9bad',
    // // -------------------------------------------------------------------------
    // 'https://starknet-sepolia.reddio.com/rpc/v0_7/rk-b244da45-a8ff-40e7-978c-76979267e390v',
    // 'https://starknet-sepolia.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
    // 'https://endpoints.omniatech.io/v1/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
    // // -------------------------------------------------------------------------
    // 'https://starknet-sepolia.drpc.org',
    // 'https://free-rpc.nethermind.io/sepolia-juno',
    // 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
    // 'https://rpc.starknet-testnet.lava.build:443',
  ],
}

export const WSS_RPC_PROVIDERS: Record<StarknetChainId, string[]> = {
  [StarknetChainId.SN_MAIN]: [
    'wss://magical-light-leaf.strk-mainnet.quiknode.pro/1f2d7acd8ab70d585a3f6f0442bf68332742ba13/',
    'wss://api-starknet-mainnet.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
    'wss://starknet-mainnet.core.chainstack.com/ws/eb9e6d5b7fd5aca63fc138fc3862fc2c',
    'wss://lb.drpc.org/ogws?network=starknet&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
    // // -------------------------------------------------------------------------
    // 'wss://starknet-mainnet.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
    // 'wss://endpoints.omniatech.io/v1/ws/starknet/mainnet/5999c7a20d6c42a9b367e4ae85b7f65c',
    // // -------------------------------------------------------------------------
    // 'wss://starknet-mainnet-rpc.dwellir.com',
    // 'wss://starknet.drpc.org',
  ],
  [StarknetChainId.SN_SEPOLIA]: [
    'wss://api-starknet-sepolia.dwellir.com/1b4bd5e6-e3bd-4732-9178-3a66c45f0952',
    'wss://lb.drpc.org/ogws?network=starknet-sepolia&dkey=Ah5vfhDAbU7znWCHm81snotf6wv3QV0R76qFUgWAgP__',
    // // -------------------------------------------------------------------------
    // 'wss://endpoints.omniatech.io/v1/ws/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
    // // -------------------------------------------------------------------------
    // 'wss://starknet-sepolia.drpc.org',
  ],
}

// -----------------------------------------------------------------------------

export function getHttpProvider(chainId: StarknetChainId) {
  if (!(chainId in HTTP_RPC_PROVIDERS)) throw new Error(`Unsupported chain ID: ${chainId}`)
  if (HTTP_RPC_PROVIDERS[chainId].length === 0)
    throw new Error(`No available HTTP RPC providers for chain ID: ${chainId}`)
  return new RpcProvider({
    nodeUrl: sample(HTTP_RPC_PROVIDERS[chainId], 1)[0],
  })
}

export function getWssProvider(chainId: StarknetChainId) {
  if (!(chainId in WSS_RPC_PROVIDERS)) throw new Error(`Unsupported chain ID: ${chainId}`)
  if (HTTP_RPC_PROVIDERS[chainId].length === 0)
    throw new Error(`No available WSS RPC providers for chain ID: ${chainId}`)
  return sample(WSS_RPC_PROVIDERS[chainId], 1)[0]
}
