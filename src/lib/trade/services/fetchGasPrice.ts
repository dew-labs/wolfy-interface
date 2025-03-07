import type {WalletAccount} from 'starknet'
import {createWolfyContract, DataStoreABI, type StarknetChainId, WolfyContract} from 'wolfy-sdk'

import {BASIS_POINTS_DIVISOR, BASIS_POINTS_DIVISOR_BIGINT} from '@/lib/trade/numbers/constants'
import roundToNDecimal from '@/utils/numbers/roundToNDecimals'

const PREMIUM = 3n // 3 FRI

// TODO: let user setting this
const FEE_BUFFER_BPS = roundToNDecimal((Number.parseFloat('30.0') * BASIS_POINTS_DIVISOR) / 100) // 30.0% buffer for gas price estimation

// gasPrice in gwei (eth, not strk)
export default async function fetchGasPrice(chainId: StarknetChainId, wallet: WalletAccount) {
  const dataStoreContract = createWolfyContract(chainId, WolfyContract.DataStore, DataStoreABI)
  dataStoreContract.connect(wallet)
  let {gas_price: gasPrice} = (await dataStoreContract.estimateFee.set_u256?.(0, 1)) as {
    gas_price: bigint
  }

  gasPrice += PREMIUM

  const buffer = (gasPrice * BigInt(FEE_BUFFER_BPS * 100)) / 100n / BASIS_POINTS_DIVISOR_BIGINT
  gasPrice += buffer

  // Add 10% margin in case the gas price is under-evaluated
  gasPrice *= 11n / 10n

  return gasPrice
}
