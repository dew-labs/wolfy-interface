import {type} from 'arktype'
import {isResponseError, isValidationError} from 'up-fetch'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'
import tryCatch from '@/utils/tryCatch'

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
} as const
export type TradeHistoryAction = (typeof TradeHistoryAction)[keyof typeof TradeHistoryAction]

export const tradeHistoryActionValues = Object.values(TradeHistoryAction)

export function isSupportedAction(action: number): action is TradeHistoryAction {
  return tradeHistoryActionValues.includes(action)
}

const tradeData = type({
  id: 'string',
  price: 'string',
  size: 'string',
  isLong: 'boolean',
  action: type.enumerated(...tradeHistoryActionValues),
  market: 'string',
  fee: 'string | null',
  rpnl: 'string | null',
  createdAt: 'number',
  txHash: 'string',
})

export type TradeData = typeof tradeData.infer

const tradeDataResponse = type({
  page: 'number',
  limit: 'number',
  count: 'number',
  totalPages: 'number',
  data: tradeData.array(),
})

export type TradeDataResponse = typeof tradeDataResponse.infer

export default async function fetchTradeHistories(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  actions: TradeHistoryAction[],
  markets: string[],
  isLong: boolean[],
  page: number,
  limit: number,
): Promise<TradeDataResponse> {
  if (!accountAddress) {
    return {page, limit, count: 0, totalPages: 0, data: []}
  }

  const {result, exception} = await tryCatch(
    call(`/api/v1/accounts/${accountAddress}/trade-history`, {
      params: {page, limit, actions, markets, isLong},
      schema: tradeDataResponse,
    }),
  )

  if (exception) {
    const error = exception.getError()

    if (isValidationError(error)) {
      console.log(error.issues)
    }

    if (isResponseError(error)) {
      console.log(error)
    }

    throw new Error('Invalid trade data received from API')
  }

  result.data.sort((a, b) => {
    const diff = b.createdAt - a.createdAt
    if (diff === 0) {
      return b.action - a.action
    }
    return diff
  })

  return result
}
