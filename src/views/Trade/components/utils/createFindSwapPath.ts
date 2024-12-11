import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {getBestSwapPath} from '@/lib/trade/utils/order/swap/getBestSwapPath'
import getSwapPathStats from '@/lib/trade/utils/order/swap/getSwapPathStats'
import type {FindSwapPath} from '@/lib/trade/utils/order/swap/types'

import getAllPaths from './getAllPaths'
import getSwapEstimator from './getSwapEstimator'

export default function createFindSwapPath(
  fromTokenAddress: string | undefined,
  toTokenAddress: string | undefined,
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) {
  const allPaths = getAllPaths(fromTokenAddress, toTokenAddress, marketsData, tokenPricesData)
  const estimator = getSwapEstimator(marketsData, tokenPricesData)

  const findSwapPath: FindSwapPath = (usdIn: bigint, opts: {byLiquidity?: boolean}) => {
    if (
      !allPaths?.length ||
      !allPaths[0] ||
      !estimator ||
      !marketsData ||
      !fromTokenAddress ||
      !tokenPricesData
    ) {
      return undefined
    }

    let swapPath: string[] | undefined

    if (opts.byLiquidity) {
      swapPath = allPaths[0].path
    } else {
      swapPath = getBestSwapPath(allPaths, usdIn, estimator)
    }

    if (!swapPath) {
      return undefined
    }

    return getSwapPathStats({
      marketsData,
      tokenPricesData,
      swapPath,
      initialCollateralAddress: fromTokenAddress,
      shouldApplyPriceImpact: true,
      usdIn,
    })
  }

  return findSwapPath
}
