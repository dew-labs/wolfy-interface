import type {StarknetChainId} from 'satoru-sdk'

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
}

function _isSupportedAction(action: unknown): action is TradeHistoryAction {
  return Object.values(TradeHistoryAction).includes(Number(action))
}

export interface TradeData {
  id: string
  action: string
  market: string
  size: number
  fee: number
  price: number
  rpnl: number
  time: Date
}

// [
//   {action: 'Market Increase', market: 'Longs', size: 1, price: 50000, rpnl: 100},
//   {action: 'Market Increase', market: 'wfSTRK / USD', size: 2, price: 3000, rpnl: 50},
//   {action: 'Create Limit Order', market: 'wfETH / USD', size: 3, price: 1.2, rpnl: 30},
//   {action: 'Sell', market: 'Longs', size: 4, price: 0.25, rpnl: -10},
// ]

export default async function fetchTradeHistories(
  _chainId: StarknetChainId,
  _accountAddress: string | undefined,
  _actions: TradeHistoryAction[],
  _markets: string[],
) {
  return Promise.resolve([] as TradeData[])
}
