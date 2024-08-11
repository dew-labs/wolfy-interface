import {sample} from 'remeda'
import {type ParsedEvent, RpcProvider} from 'starknet'

import {StarknetChainId} from './chains'
import {getContractAddress, SatoruContract} from './contracts'
import {getSatoruEventHash, type ParsedSatoruEvent, parseEvent, type SatoruEvent} from './events'

export const HTTP_RPC_PROVIDERS: Record<StarknetChainId, string[]> = {
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
    'https://starknet-sepolia.g.allthatnode.com/archive/json_rpc/dddb6fbb899443e9829053b0bc0d9f65',
    'https://endpoints.omniatech.io/v1/starknet/sepolia/bb7dbf2360f246bfacce409fdd752e93',
    // -------------------------------------------------------------------------
    // 'https://starknet-sepolia.drpc.org',
    'https://free-rpc.nethermind.io/sepolia-juno',
    'https://starknet-sepolia.public.blastapi.io/rpc/v0_7',
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

// -----------------------------------------------------------------------------

export function getHttpProvider(chainId: StarknetChainId) {
  if (!(chainId in HTTP_RPC_PROVIDERS)) throw new Error(`Unsupported chain ID: ${chainId}`)
  if (HTTP_RPC_PROVIDERS[chainId].length === 0)
    throw new Error(`No available HTTP RPC providers for chain ID: ${chainId}`)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed non-null
  const sampleProvider = sample(HTTP_RPC_PROVIDERS[chainId], 1)[0]!

  return new RpcProvider({
    nodeUrl: sampleProvider,
    batch: 0,
  })
}

// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- in order to achieve optional generic
export type SatoruEventHandler<T extends SatoruEvent | void = void> = (
  event: T extends SatoruEvent ? ParsedSatoruEvent<T> : ParsedEvent,
) => void

function createWebsocketProvider(url: string, chainId: StarknetChainId) {
  const eventEmitterAddress = getContractAddress(chainId, SatoruContract.EventEmitter)

  const ws = new WebSocket(url)
  let id = 0
  const pendingMessages: string[] = []
  const promises = new Map<
    number,
    | {
        eventHandler: SatoruEventHandler
        resolve: (unsubscriber: () => Promise<void>) => void
        reject: (error: Error) => void
      }
    | {
        eventHandler: undefined
        resolve: (result: boolean) => void
        reject: (error: Error) => void
      }
  >()
  const eventHandlers = new Map<number, SatoruEventHandler>()

  ws.onopen = () => {
    console.log(`WebSocket Provider connected to ${url}`)
    while (pendingMessages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed non-null
      ws.send(pendingMessages.shift()!)
    }
  }

  ws.onerror = error => {
    console.error(`WebSocketProvider error:`, error)
  }

  ws.onmessage = message => {
    console.log(`WebSocketProvider received message: ${message.data}`)

    if (typeof message.data !== 'string') return
    const data = JSON.parse(message.data)

    if (data && typeof data === 'object' && 'result' in data) {
      // Subscribe & Unsubscribe messages
      if ('id' in data && typeof data.id === 'number') {
        const id = data.id
        if (promises.has(id)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed non-null
          const promise = promises.get(id)!

          if (promise.eventHandler) {
            if (typeof data.result === 'number') {
              const subscription = data.result
              eventHandlers.set(subscription, promise.eventHandler)
              promise.resolve(async () => unsubscribe(subscription))
            } else
              promise.resolve(async () => {
                // empty
              })
          } else {
            if (typeof data.result === 'boolean') promise.resolve(data.result)
            else promise.resolve(false)
          }
          promises.delete(id)
        }
        return
      }

      // Subscription event messages
      if (
        'method' in data &&
        data.method === 'pathfinder_subscription' &&
        data.result &&
        typeof data.result === 'object' &&
        'subscription' in data.result &&
        typeof data.result.subscription === 'number' &&
        'result' in data.result
      ) {
        const handler = eventHandlers.get(data.result.subscription)
        if (!handler) return
        const parsedEvent = parseEvent(data.result.result)
        if (!parsedEvent) return
        handler(parsedEvent as never)
      }
    }
  }

  ws.onclose = () => {
    console.log('WebSocket Provider disconnected')
  }

  async function send<T extends SatoruEvent>(
    message: {method: string; params: unknown},
    eventHandler: SatoruEventHandler<T>,
  ): Promise<() => Promise<boolean>>
  async function send(message: {method: string; params: unknown}): Promise<void>
  async function send(
    message: {method: string; params: unknown},
    eventHandler?: SatoruEventHandler,
  ) {
    if ([WebSocket.CLOSED, WebSocket.CLOSING].includes(ws.readyState)) {
      return Promise.reject(new Error('WebSocket Provider is not closed'))
    }

    id++
    const toSend = JSON.stringify({
      id,
      jsonrpc: '2.0',
      method: message.method,
      params: message.params,
    })

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(toSend)
    }

    if (ws.readyState === WebSocket.CONNECTING) {
      pendingMessages.push(toSend)
    }

    return new Promise((resolve, reject) => {
      promises.set(id, {eventHandler, resolve, reject})
    })
  }

  async function subscribeToEvent<T extends SatoruEvent>(
    event: T,
    eventHandler: SatoruEventHandler<T>,
  ) {
    const eventHash = getSatoruEventHash(event)
    return send(
      {
        method: 'pathfinder_subscribe',
        params: {
          kind: 'events',
          address: eventEmitterAddress,
          keys: [[eventHash]],
        },
      },
      eventHandler,
    )
  }

  async function unsubscribe(id: number) {
    return send({
      method: 'pathfinder_unsubscribe',
      params: [id],
    })
  }

  function close() {
    ws.close()
  }

  return {
    subscribeToEvent,
    close,
  }
}

export function getWssProvider(chainId: StarknetChainId) {
  if (!(chainId in WSS_RPC_PROVIDERS)) throw new Error(`Unsupported chain ID: ${chainId}`)
  if (HTTP_RPC_PROVIDERS[chainId].length === 0)
    throw new Error(`No available WSS RPC providers for chain ID: ${chainId}`)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed non-null
  const sampleProvider = sample(WSS_RPC_PROVIDERS[chainId], 1)[0]!

  return createWebsocketProvider(sampleProvider, chainId)
}

// Usages:
// const wssProvider = getWssProvider(chainId)

// const eventHandler: SatoruEventHandler<SatoruEvent.OrderCreated> = e => {
//   console.log(e)
// }
// const unsubscribe = await wssProvider.subscribeToEvent(SatoruEvent.OrderCreated, eventHandler)
