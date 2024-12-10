import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'

import type {MarketsGraph} from './getMarketsGraph'
import getMaxSwapPathLiquidity from './getMaxSwapPathLiquidity'
import type {MarketEdge, SwapRoute} from './types'

export default function findAllPaths(
  marketsData: MarketsData,
  graph: MarketsGraph,
  from: string,
  to: string,
  tokenPricesData: TokenPricesData,
  maxDepth = 3,
): SwapRoute[] | undefined {
  const routes: SwapRoute[] = []

  const edges = graph.adjacencyList[from]

  if (!edges?.length) {
    return undefined
  }

  for (const e of edges) {
    dfs(e, [], [], {})
  }

  function dfs(
    edge: MarketEdge,
    path: string[],
    pathEdges: MarketEdge[],
    visited: Record<string, boolean>,
  ) {
    // avoid too deep paths and cycles
    if (path.length >= maxDepth || visited[edge.marketAddress]) {
      return
    }

    visited[edge.marketAddress] = true
    pathEdges.push(edge)
    path.push(edge.marketAddress)

    if (edge.to === to) {
      routes.push({
        edged: pathEdges,
        path,
        liquidity: getMaxSwapPathLiquidity({
          marketsData,
          swapPath: path,
          initialCollateralAddress: from,
          tokenPricesData,
        }),
      })
      return
    }

    const edges = graph.adjacencyList[edge.to]

    if (!edges?.length) {
      return
    }

    for (const e of edges) {
      dfs(e, [...path], [...pathEdges], {...visited})
    }
  }

  return routes
}
