import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'

export const TradeHistoryAction = {
  // Market Order
  // Market Increase
  RequestMarketIncrease: 0,
  MarketIncrease: 1,
  FailedMarketIncrease: 2,
  CancelMarketIncrease: 3,

  // Market Decrease
  RequestMarketDecrease: 4,
  MarketDecrease: 5,
  FailedMarketDecrease: 6,
  CancelMarketDecrease: 7,

  // Trigger Order
  // Limit Order
  CreateLimitOrder: 8,
  UpdateLimitOrder: 9,
  ExecuteLimitOrder: 10,
  FailedLimitOrder: 11,
  CancelLimitOrder: 12,

  // Take Profit Order
  CreateTakeProfitOrder: 13,
  UpdateTakeProfitOrder: 14,
  ExecuteTakeProfitOrder: 15,
  FailedTakeProfitOrder: 16,
  CancelTakeProfitOrder: 17,

  // Stop Loss Order
  CreateStopLossOrder: 18,
  UpdateStopLossOrder: 19,
  ExecuteStopLossOrder: 20,
  FailedStopLossOrder: 21,
  CancelStopLossOrder: 22,

  // Swap Order
  // Market Swap
  RequestMarketSwap: 23,
  ExecuteMarketSwap: 24,
  FailedMarketSwap: 25,
  CancelMarketSwap: 26,

  // Limit Swap
  CreateLimitSwap: 27,
  UpdateLimitSwap: 28,
  ExecuteLimitSwap: 29,
  FailedLimitSwap: 30,
  CancelLimitSwap: 31,

  // Deposit
  RequestDeposit: 32,
  Deposit: 33,
  FailedDeposit: 34,
  CancelDeposit: 35,

  // Withdrawal
  RequestWithdraw: 36,
  Withdraw: 37,
  FailedWithdraw: 38,
  CancelWithdraw: 39,

  // Liquidation,
  Liquidation: 40,

  // Position
  PositionIncrease: 41,
  PositionDecrease: 42,
}
export type TradeHistoryAction = (typeof TradeHistoryAction)[keyof typeof TradeHistoryAction]

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
  const url = `/api/v1/accounts/${accountAddress}/trade-history`
  const endpoint = query ? `${url}?${query}` : url

  const response = await call.get(endpoint)

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
