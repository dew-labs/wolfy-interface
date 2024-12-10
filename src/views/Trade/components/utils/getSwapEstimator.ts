import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import createSwapEstimator from '@/lib/trade/utils/order/swap/createSwapEstimator'

export default function getSwapEstimator(
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) {
  if (!marketsData || !tokenPricesData) return undefined
  return createSwapEstimator(marketsData, tokenPricesData)
}
