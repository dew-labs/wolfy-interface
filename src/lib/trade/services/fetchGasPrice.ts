import {createCall, createSatoruContract, DataStoreABI, SatoruContract} from 'satoru-sdk'
import type {WalletAccount} from 'starknet'

import {BASIS_POINTS_DIVISOR, BASIS_POINTS_DIVISOR_BIGINT} from '@/lib/trade/numbers/constants'
import {roundToNDecimal} from '@/utils/numbers/roundToNDecimals'

const PREMIUM = 3n // 3 FRI

// TODO: let user setting this
const FEE_BUFFER_BPS = roundToNDecimal((parseFloat('30.0') * BASIS_POINTS_DIVISOR) / 100) // 30.0% buffer for gas price estimation

export default async function fetchGasPrice(wallet: WalletAccount) {
  try {
    const chainId = await wallet.getChainId()
    const dataStoreContract = createSatoruContract(chainId, SatoruContract.DataStore, DataStoreABI)
    const testCall = createCall(dataStoreContract, 'get_u256', [0])
    let gasPrice = (await wallet.estimateFee(testCall)).gas_price

    gasPrice += PREMIUM

    const buffer = (gasPrice * BigInt(FEE_BUFFER_BPS * 100)) / 100n / BASIS_POINTS_DIVISOR_BIGINT
    gasPrice += buffer

    // Add 10% margin in case the gas price is under-evaluated
    gasPrice *= 11n / 10n

    return gasPrice
  } catch (e) {
    console.error(e)
    return null
  }
}
