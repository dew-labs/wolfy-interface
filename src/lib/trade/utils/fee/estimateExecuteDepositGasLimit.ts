import type {GasLimitsConfig} from '@/lib/trade/services/fetchGasLimits'

export default function estimateExecuteDepositGasLimit(
  gasLimits: GasLimitsConfig,
  deposit: {
    longTokenSwapPath?: string[] | undefined
    shortTokenSwapPath?: string[] | undefined
    initialLongTokenAmount?: bigint | undefined
    initialShortTokenAmount?: bigint | undefined
    callbackGasLimit?: bigint | undefined
  },
) {
  const gasPerSwap = gasLimits.singleSwap
  const swapsCount =
    (deposit.longTokenSwapPath?.length ?? 0) + (deposit.shortTokenSwapPath?.length ?? 0)

  const gasForSwaps = gasPerSwap * BigInt(swapsCount)
  const isMultiTokenDeposit =
    deposit.initialLongTokenAmount &&
    deposit.initialLongTokenAmount > 0n &&
    deposit.initialShortTokenAmount &&
    deposit.initialShortTokenAmount > 0n

  const depositGasLimit = isMultiTokenDeposit
    ? gasLimits.depositMultiToken
    : gasLimits.depositSingleToken

  return depositGasLimit + gasForSwaps + (deposit.callbackGasLimit ?? 0n)
}
