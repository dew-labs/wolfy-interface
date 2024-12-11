import type {SwapEstimator, SwapRoute} from './types'

export function getBestSwapPath(routes: SwapRoute[], usdIn: bigint, estimator: SwapEstimator) {
  if (routes.length === 0 || !routes[0]) {
    return undefined
  }

  let bestPath = routes[0].path
  let bestUsdOut = 0n

  for (const route of routes) {
    try {
      const pathUsdOut = route.edged.reduce((prevUsdOut, edge) => {
        const {usdOut} = estimator(edge, prevUsdOut)
        return usdOut
      }, usdIn)

      if (pathUsdOut > bestUsdOut) {
        bestPath = route.path
        bestUsdOut = pathUsdOut
      }
    } catch {
      continue
    }
  }

  return bestPath
}
