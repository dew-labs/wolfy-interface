import type {
  ExtractAbiFunctionNames,
  FunctionArgs,
  FunctionRet,
} from 'node_modules/abi-wan-kanabi/dist/kanabi'
import {
  type Abi,
  CallData,
  Contract,
  hash,
  type ProviderInterface,
  type RawArgs,
  type TypedContractV2,
} from 'starknet'

import DataStoreABI from '@/abis/DataStoreABI'
import DepositVaultABI from '@/abis/DepositVaultABI'
import EventEmitterABI from '@/abis/EventEmitterABI'
import ExchangeRouterABI from '@/abis/ExchangeRouterABI'
import MulticallABI from '@/abis/MulticallABI'
import OrderVaultABI from '@/abis/OrderVaultABI'
import ReaderABI from '@/abis/ReaderABI'
import ReferralStorageABI from '@/abis/ReferralStorageABI'
import RouterABI from '@/abis/RouterABI'
import WithdrawalVaultABI from '@/abis/WithdrawalVaultABI'
import toStarknetAddress from '@/lib/starknet/utils/toStarknetAddress'

import {StarknetChainId} from './chains'
import {getHttpProvider} from './rpcProviders'

export const ADDRESS_ZERO = toStarknetAddress(0)
export const HASH_ZERO = '0x0'

export enum SatoruContract {
  Multicall,
  DataStore,
  EventEmitter,
  ReferralStorage,
  OrderVault,
  DepositVault,
  WithdrawalVault,
  Reader,
  Router,
  ExchangeRouter,
}

const CONTRACT_ABIS = {
  [SatoruContract.Multicall]: MulticallABI,
  [SatoruContract.DataStore]: DataStoreABI,
  [SatoruContract.EventEmitter]: EventEmitterABI,
  [SatoruContract.ReferralStorage]: ReferralStorageABI,
  [SatoruContract.OrderVault]: OrderVaultABI,
  [SatoruContract.DepositVault]: DepositVaultABI,
  [SatoruContract.WithdrawalVault]: WithdrawalVaultABI,
  [SatoruContract.Reader]: ReaderABI,
  [SatoruContract.Router]: RouterABI,
  [SatoruContract.ExchangeRouter]: ExchangeRouterABI,
} as const satisfies Record<SatoruContract, Abi>

const CONTRACT_ADDRESSES: Record<StarknetChainId, Record<SatoruContract, string>> = {
  [StarknetChainId.SN_SEPOLIA]: {
    [SatoruContract.Multicall]: '0x62e7261fc39b214e56a5dc9b6f77674d953973d1b8892f14d76f88c97909647',
    [SatoruContract.DataStore]: '0x65a0d6a12081ff3974c0f7ff6f7378cb44aceb92672c799b2d5125cf38d7a54',
    [SatoruContract.EventEmitter]:
      '0x2fefd04d5bdc737040c9b6f0f9859a2bbf38c73024ab30ca9494e5308fb071c',
    [SatoruContract.ReferralStorage]:
      '0x5623345008a614ab48687e3dd8c14ac8ac4844171749dc8faa5dd7ef1fcace6',
    [SatoruContract.OrderVault]:
      '0x2d7ab0dbd9b2d65625099fe118e8259215a6023ecb9cb75bb20e168ce9f6017',
    [SatoruContract.DepositVault]:
      '0x4654e66ae6cde15397ec44b3ecf8d10e939536880c32327b20055dd720ef020',
    [SatoruContract.WithdrawalVault]:
      '0x37cb75f07fce05ca57ae24719c5a7d9c0e1fc8dbf850bfdc0a0e262e6f8c6e0',
    [SatoruContract.Reader]: '0x7ca9fde877d056206fe73b914b79ebaf04d90771da22fcba2af2a1f5785dba9',
    [SatoruContract.Router]: '0xdb8caa98e6369b01147cf7190915710e2baf41d55e212622cf3c17f4be597',
    [SatoruContract.ExchangeRouter]:
      '0x2c1cae8834b0e89e46453189bfb264ea617d55922009c5a75f57130517bc16f',
  },
  // Not available
  [StarknetChainId.SN_MAIN]: {
    [SatoruContract.Multicall]: '0x620d16d511f5732fffc6ac780352619396f42f43ee3124af4123db199f0be2e',
    [SatoruContract.DataStore]: '0x65a0d6a12081ff3974c0f7ff6f7378cb44aceb92672c799b2d5125cf38d7a54',
    [SatoruContract.EventEmitter]:
      '0x2fefd04d5bdc737040c9b6f0f9859a2bbf38c73024ab30ca9494e5308fb071c',
    [SatoruContract.ReferralStorage]:
      '0x5623345008a614ab48687e3dd8c14ac8ac4844171749dc8faa5dd7ef1fcace6',
    [SatoruContract.OrderVault]:
      '0x2d7ab0dbd9b2d65625099fe118e8259215a6023ecb9cb75bb20e168ce9f6017',
    [SatoruContract.DepositVault]:
      '0x4654e66ae6cde15397ec44b3ecf8d10e939536880c32327b20055dd720ef020',
    [SatoruContract.WithdrawalVault]:
      '0x37cb75f07fce05ca57ae24719c5a7d9c0e1fc8dbf850bfdc0a0e262e6f8c6e0',
    [SatoruContract.Reader]: '0x7ca9fde877d056206fe73b914b79ebaf04d90771da22fcba2af2a1f5785dba9',
    [SatoruContract.Router]: '0xdb8caa98e6369b01147cf7190915710e2baf41d55e212622cf3c17f4be597',
    [SatoruContract.ExchangeRouter]:
      '0x2c1cae8834b0e89e46453189bfb264ea617d55922009c5a75f57130517bc16f',
  },
}

export function getContractAddress(chainId: StarknetChainId, contract: SatoruContract): string {
  if (!CONTRACT_ADDRESSES[chainId][contract]) {
    throw new Error(`No contract address found for chain ID: ${chainId}`)
  }

  return CONTRACT_ADDRESSES[chainId][contract]
}

export function getContractAbi<T extends SatoruContract>(contract: T): (typeof CONTRACT_ABIS)[T] {
  return CONTRACT_ABIS[contract]
}

export function newContract<T extends Abi>(
  abi: T,
  address: string,
  providerOrAccount: ProviderInterface,
): TypedContractV2<T> {
  return new Contract(abi, address, providerOrAccount).typedv2(abi)
}

export function newSatoruContract<T extends SatoruContract>(chainId: StarknetChainId, contract: T) {
  return newContract(
    getContractAbi(contract),
    getContractAddress(chainId, contract),
    getHttpProvider(chainId),
  )
}

export function createCalldata<
  ContractName extends SatoruContract,
  SatoruAbi extends (typeof CONTRACT_ABIS)[ContractName],
  Method extends ExtractAbiFunctionNames<SatoruAbi>,
  // @ts-expect-error -- complex typescript
  Args extends FunctionArgs<SatoruAbi, Method> extends unknown[]
    ? // @ts-expect-error -- complex typescript
      FunctionArgs<SatoruAbi, Method>
    : // @ts-expect-error -- complex typescript
      [FunctionArgs<SatoruAbi, Method>],
>(
  chainId: StarknetChainId,
  contractName: ContractName,
  method: Method,
  args?: Args,
): {
  abi: SatoruAbi
  contractAddress: string
  entrypoint: Method
  calldata: Args
} {
  const contract = newSatoruContract(chainId, contractName)
  const abi = getContractAbi(contractName)
  const call = contract.populate(method, args as RawArgs)

  return {
    abi: abi as SatoruAbi,
    contractAddress: call.contractAddress,
    entrypoint: method,
    calldata: call.calldata as Args,
  }
}

interface CallAndAbi {
  abi: Abi
  contractAddress: string
  entrypoint: string
  calldata: unknown
}

export async function multicall<T extends CallAndAbi, Ts extends T[]>(
  chainId: StarknetChainId,
  calls: Ts,
): Promise<{[k in keyof Ts]: FunctionRet<Ts[k]['abi'], Ts[k]['entrypoint']>}> {
  const multicallContract = newSatoruContract(chainId, SatoruContract.Multicall)

  const results = await multicallContract.aggregate(
    calls.map(call => {
      return {
        to: call.contractAddress,
        selector: hash.getSelectorFromName(call.entrypoint),
        calldata: call.calldata as bigint[],
      }
    }),
  )

  // @ts-expect-error -- too complex
  return results[1].map((result, index) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
    const callData = new CallData(calls[index]!.abi)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
    return callData.parse(calls[index]!.entrypoint, result as unknown as string[])
  })
}

export default CONTRACT_ADDRESSES
