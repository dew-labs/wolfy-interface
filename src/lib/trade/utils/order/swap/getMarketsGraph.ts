import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'

import type {MarketEdge} from './types'

export interface MarketsGraph {
  adjacencyList: Record<string, MarketEdge[]>
  edges: MarketEdge[]
}

export default function getMarketsGraph(marketsData: MarketsData): MarketsGraph {
  const graph: MarketsGraph = {adjacencyList: {}, edges: []}

  marketsData.forEach(market => {
    const {longTokenAddress, shortTokenAddress, marketTokenAddress, isSameCollaterals, isDisabled} =
      market

    if (isSameCollaterals || isDisabled) {
      return
    }

    const longShortEdge: MarketEdge = {
      marketInfo: market,
      marketAddress: marketTokenAddress,
      from: longTokenAddress,
      to: shortTokenAddress,
    }

    const shortLongEdge: MarketEdge = {
      marketInfo: market,
      marketAddress: marketTokenAddress,
      from: shortTokenAddress,
      to: longTokenAddress,
    }

    graph.adjacencyList[longTokenAddress] = graph.adjacencyList[longTokenAddress] ?? []
    graph.adjacencyList[longTokenAddress].push(longShortEdge)
    graph.adjacencyList[shortTokenAddress] = graph.adjacencyList[shortTokenAddress] ?? []
    graph.adjacencyList[shortTokenAddress].push(shortLongEdge)

    graph.edges.push(longShortEdge, shortLongEdge)
  })

  return graph
}
