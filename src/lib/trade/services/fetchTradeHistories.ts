import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'

export enum TradeHistoryAction {
  // Market Order
  // Market Increase
  RequestMarketIncrease,
  MarketIncrease,
  FailedMarketIncrease,
  CancelMarketIncrease,

  // Market Decrease
  RequestMarketDecrease,
  MarketDecrease,
  FailedMarketDecrease,
  CancelMarketDecrease,

  // Trigger Order
  // Limit Order
  CreateLimitOrder,
  UpdateLimitOrder,
  ExecuteLimitOrder,
  FailedLimitOrder,
  CancelLimitOrder,

  // Take Profit Order
  CreateTakeProfitOrder,
  UpdateTakeProfitOrder,
  ExecuteTakeProfitOrder,
  FailedTakeProfitOrder,
  CancelTakeProfitOrder,

  // Stop Loss Order
  CreateStopLossOrder,
  UpdateStopLossOrder,
  ExecuteStopLossOrder,
  FailedStopLossOrder,
  CancelStopLossOrder,

  // Swap Order
  // Market Swap
  RequestMarketSwap,
  ExecuteMarketSwap,
  FailedMarketSwap,
  CancelMarketSwap,

  // Limit Swap
  CreateLimitSwap,
  UpdateLimitSwap,
  ExecuteLimitSwap,
  FailedLimitSwap,
  CancelLimitSwap,

  // Deposit
  RequestDeposit,
  Deposit,
  FailedDeposit,
  CancelDeposit,

  // Withdrawal
  RequestWithdraw,
  Withdraw,
  FailedWithdraw,
  CancelWithdraw,

  // Liquidation,
  Liquidation,

  // Position
  PositionIncrease,
  PositionDecrease,
}

function _isSupportedAction(action: unknown): action is TradeHistoryAction {
  return Object.values(TradeHistoryAction).includes(action as TradeHistoryAction)
}

const tradeDataSchema = Type.Object({
  page: Type.Number(),
  limit: Type.Number(),
  count: Type.Number(),
  totalPages: Type.Number(),
  data: Type.Array(
    Type.Object({
      id: Type.String(),
      price: Type.String(),
      size: Type.String(),
      isLong: Type.Boolean(),
      action: Type.Enum(TradeHistoryAction),
      market: Type.String(),
      fee: Type.Union([Type.String(), Type.Null()]),
      rpnl: Type.Union([Type.String(), Type.Null()]),
      createdAt: Type.Number(),
      txHash: Type.String(),
    }),
  ),
})

export type TradeData = Static<typeof tradeDataSchema>
const tradeDataTypeCheck = TypeCompiler.Compile(tradeDataSchema)

export function isTradeData(data: unknown): data is TradeData {
  return tradeDataTypeCheck.Check(data)
}

export default async function fetchTradeHistories(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
): Promise<TradeData> {
  if (!accountAddress) {
    return {page, limit, count: 0, totalPages: 0, data: []}
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  actions.forEach(action => {
    params.append('actions', action.toString())
  })
  markets.forEach(market => {
    params.append('markets', market)
  })
  isLong.forEach(long => {
    params.append('isLong', long ? 'true' : 'false')
  })

  const query = params.toString()

  const response = await call.get(
    `/api/v1/accounts/${accountAddress}/trade-history${query ? `?${query}` : ''}`,
  )

  if (!isTradeData(response.data)) {
    throw new Error('Invalid trade data received from API')
  }

  response.data.data.sort((a, b) => {
    const result = b.createdAt - a.createdAt
    if (result === 0) {
      return b.action - a.action
    }
    return result
  })

  return response.data
}
