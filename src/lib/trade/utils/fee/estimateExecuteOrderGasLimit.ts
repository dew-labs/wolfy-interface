import type {GasLimitsConfig} from '@/lib/trade/services/fetchGasLimits'

export default function estimateExecuteOrderGasLimit(
  type: 'increase' | 'decrease' | 'swap',
  gasLimits: GasLimitsConfig,
  order: {swapPath?: string[]; callbackGasLimit?: bigint},
) {
  const swapsCount = BigInt(order.swapPath?.length ?? 0)

  const gasLimit = (() => {
    switch (type) {
      case 'increase':
        return gasLimits.increaseOrder
      case 'decrease':
        return gasLimits.decreaseOrder
      case 'swap':
        return gasLimits.swapOrder
    }
  })()

  return gasLimit + gasLimits.singleSwap * swapsCount + (order.callbackGasLimit ?? 0n)
}
