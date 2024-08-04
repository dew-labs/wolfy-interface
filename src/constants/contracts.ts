import {type Abi, Contract, type ProviderInterface, type TypedContractV2} from 'starknet'

import toStarknetAddress from '@/lib/starknet/utils/toStarknetAddress'

import {StarknetChainId} from './chains'

export const ADDRESS_ZERO = toStarknetAddress(0)
export const HASH_ZERO = '0x0'

type AvailableContract =
  | 'DataStore'
  | 'EventEmitter'
  | 'ReferralStorage'
  | 'OrderVault'
  | 'DepositVault'
  | 'WithdrawalVault'
  | 'Reader'
  | 'Router'
  | 'ExchangeRouter'

const CONTRACT_ADDRESS = new Map<StarknetChainId, Map<AvailableContract, string>>([
  [
    StarknetChainId.SN_SEPOLIA,
    new Map([
      ['DataStore', '0x65a0d6a12081ff3974c0f7ff6f7378cb44aceb92672c799b2d5125cf38d7a54'],
      ['EventEmitter', '0x2fefd04d5bdc737040c9b6f0f9859a2bbf38c73024ab30ca9494e5308fb071c'],
      ['ReferralStorage', '0x5623345008a614ab48687e3dd8c14ac8ac4844171749dc8faa5dd7ef1fcace6'],
      ['OrderVault', '0x2d7ab0dbd9b2d65625099fe118e8259215a6023ecb9cb75bb20e168ce9f6017'],
      ['DepositVault', '0x4654e66ae6cde15397ec44b3ecf8d10e939536880c32327b20055dd720ef020'],
      ['WithdrawalVault', '0x37cb75f07fce05ca57ae24719c5a7d9c0e1fc8dbf850bfdc0a0e262e6f8c6e0'],
      ['Reader', '0x7ca9fde877d056206fe73b914b79ebaf04d90771da22fcba2af2a1f5785dba9'],
      ['Router', '0xdb8caa98e6369b01147cf7190915710e2baf41d55e212622cf3c17f4be597'],
      ['ExchangeRouter', '0x2c1cae8834b0e89e46453189bfb264ea617d55922009c5a75f57130517bc16f'],
    ]),
  ],
  // Not available
  [
    StarknetChainId.SN_MAIN,
    new Map([
      ['DataStore', '0x65a0d6a12081ff3974c0f7ff6f7378cb44aceb92672c799b2d5125cf38d7a54'],
      ['EventEmitter', '0x2fefd04d5bdc737040c9b6f0f9859a2bbf38c73024ab30ca9494e5308fb071c'],
      ['ReferralStorage', '0x5623345008a614ab48687e3dd8c14ac8ac4844171749dc8faa5dd7ef1fcace6'],
      ['OrderVault', '0x2d7ab0dbd9b2d65625099fe118e8259215a6023ecb9cb75bb20e168ce9f6017'],
      ['DepositVault', '0x4654e66ae6cde15397ec44b3ecf8d10e939536880c32327b20055dd720ef020'],
      ['WithdrawalVault', '0x37cb75f07fce05ca57ae24719c5a7d9c0e1fc8dbf850bfdc0a0e262e6f8c6e0'],
      ['Reader', '0x7ca9fde877d056206fe73b914b79ebaf04d90771da22fcba2af2a1f5785dba9'],
      ['Router', '0xdb8caa98e6369b01147cf7190915710e2baf41d55e212622cf3c17f4be597'],
      ['ExchangeRouter', '0x2c1cae8834b0e89e46453189bfb264ea617d55922009c5a75f57130517bc16f'],
    ]),
  ],
])

export function getContractAddress(chainId: StarknetChainId, contract: AvailableContract): string {
  if (!CONTRACT_ADDRESS.get(chainId)?.has(contract)) {
    throw new Error(`No contract address found for chain ID: ${chainId}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- already throw if !.has
  return CONTRACT_ADDRESS.get(chainId)!.get(contract)!
}

export function newContract<T extends Abi>(
  abi: T,
  address: string,
  providerOrAccount: ProviderInterface,
): TypedContractV2<T> {
  return new Contract(abi, address, providerOrAccount).typedv2(abi)
}

export default CONTRACT_ADDRESS
