import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import findAllPaths from '@/lib/trade/utils/order/swap/findAllPaths'
import getMarketsGraph from '@/lib/trade/utils/order/swap/getMarketsGraph'

export default function getAllPaths(
  fromTokenAddress: string | undefined,
  toTokenAddress: string | undefined,
  marketsData: MarketsData | undefined,
  tokenPricesData: TokenPricesData | undefined,
) {
  if (!marketsData || !tokenPricesData || !fromTokenAddress || !toTokenAddress) return undefined

  const graph = getMarketsGraph(marketsData)
  const isSameToken = fromTokenAddress === toTokenAddress

  if (isSameToken) {
    return undefined
  }

  return findAllPaths(marketsData, graph, fromTokenAddress, toTokenAddress, tokenPricesData)?.sort(
    (a, b) => (b.liquidity - a.liquidity > 0 ? 1 : -1),
  )
}
