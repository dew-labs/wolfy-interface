import {getProvider, ProviderType, type StarknetChainId} from 'wolfy-sdk'

import {BASIS_POINTS_DIVISOR, BASIS_POINTS_DIVISOR_BIGINT} from '@/lib/trade/numbers/constants'
import roundToNDecimal from '@/utils/numbers/roundToNDecimals'

const PREMIUM = 3n // 3 GWEI

// TODO: let user setting this
const FEE_BUFFER_BPS = roundToNDecimal((Number.parseFloat('30.0') * BASIS_POINTS_DIVISOR) / 100) // 30.0% buffer for gas price estimation

// gasPrice in GWEI
export default async function fetchGasPrice(chainId: StarknetChainId) {
  const provider = getProvider(ProviderType.HTTP, chainId)
  const latestBlockNumber = (await provider.getBlockLatestAccepted()).block_number
  let gasPrice = BigInt((await provider.getL1GasPrice(latestBlockNumber)) || 1000000000n)

  gasPrice += PREMIUM

  const buffer = (gasPrice * BigInt(FEE_BUFFER_BPS * 100)) / 100n / BASIS_POINTS_DIVISOR_BIGINT
  gasPrice += buffer

  // Add 10% margin in case the gas price is under-evaluated
  gasPrice *= 11n / 10n

  return gasPrice
}
