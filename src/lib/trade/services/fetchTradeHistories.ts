import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'
import type {StarknetChainId} from 'satoru-sdk'

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
      fee: Type.Optional(Type.String()),
      rpnl: Type.Optional(Type.String()),
      createdAt: Type.Optional(Type.Number()),
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
  totalPages: number,
): Promise<TradeData> {
  console.log('Fetching trade histories with:', {
    chainId,
    accountAddress,
    actions,
    markets,
    isLong,
    page,
    limit,
    totalPages,
  })

  if (!accountAddress) {
    console.log('No account address provided, returning empty array.')
    return {page, limit, count: 0, totalPages: 0, data: []}
  }

  try {
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

    const response = await call.get<TradeData>(
      `/api/v1/accounts/${accountAddress}/trade-history${query ? `?${query}` : ''}`,
    )
    // console.log('API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching trade histories:', error)
    throw error
  }
}
