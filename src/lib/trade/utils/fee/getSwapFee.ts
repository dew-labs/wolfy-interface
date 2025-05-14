import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'

export default function getSwapFee(
  marketInfo: MarketData,
  swapAmount: bigint,
  forPositiveImpact: boolean,
) {
  const factor = forPositiveImpact
    ? marketInfo.swapFeeFactorForPositiveImpact
    : marketInfo.swapFeeFactorForNegativeImpact

  return applyFactor(swapAmount, factor)
}
