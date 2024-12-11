import type {SwapStats} from '@/lib/trade/utils/order/swap/getSwapPathStats'

export function getTotalSwapVolumeFromSwapStats(swapSteps?: SwapStats[]) {
  if (!swapSteps) return 0n

  return swapSteps.reduce((acc, curr) => {
    return acc + curr.usdIn
  }, 0n)
}
