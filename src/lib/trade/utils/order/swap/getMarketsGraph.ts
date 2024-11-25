import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'

import type {MarketEdge} from './types'

export interface MarketsGraph {
  abjacencyList: Record<string, MarketEdge[]>
  edges: MarketEdge[]
}

export default function getMarketsGraph(marketsData: MarketsData): MarketsGraph {
  const graph: MarketsGraph = {
    abjacencyList: {},
    edges: [],
  }

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

    graph.abjacencyList[longTokenAddress] = graph.abjacencyList[longTokenAddress] ?? []
    graph.abjacencyList[longTokenAddress].push(longShortEdge)
    graph.abjacencyList[shortTokenAddress] = graph.abjacencyList[shortTokenAddress] ?? []
    graph.abjacencyList[shortTokenAddress].push(shortLongEdge)

    graph.edges.push(longShortEdge, shortLongEdge)
  })

  return graph
}
