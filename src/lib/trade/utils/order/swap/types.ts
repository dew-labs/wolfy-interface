import type {MarketData} from '@/lib/trade/services/fetchMarketData'

import type {SwapPathStats} from './getSwapPathStats'

export type FindSwapPath = (
  usdIn: bigint,
  opts: {byLiquidity?: boolean},
) => SwapPathStats | undefined

export interface MarketEdge {
  marketAddress: string
  marketInfo: MarketData
  // from token
  from: string
  // to token
  to: string
}

export interface SwapRoute {
  edged: MarketEdge[]
  path: string[]
  liquidity: bigint
}

export interface SwapAmounts {
  amountIn: bigint
  usdIn: bigint
  amountOut: bigint
  usdOut: bigint
  priceIn: bigint
  priceOut: bigint
  swapPathStats: SwapPathStats | undefined
  minOutputAmount: bigint
  uiFeeUsd?: bigint
}

export type SwapEstimator = (
  e: MarketEdge,
  usdIn: bigint,
) => {
  usdOut: bigint
}
