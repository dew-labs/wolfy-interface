import type {GasLimitsConfig} from '@/lib/trade/services/fetchGasLimits'

export default function estimateExecuteWithdrawalGasLimit(
  gasLimits: GasLimitsConfig,
  withdrawal: {callbackGasLimit?: bigint | undefined},
) {
  return gasLimits.withdrawalMultiToken + (withdrawal.callbackGasLimit ?? 0n)
}
