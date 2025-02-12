import {type} from 'arktype'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'

import {type TradeHistoryAction, tradeHistoryActionValues} from './fetchTradeHistories'

const depositWithdrawalHistory = type({
  id: 'string#DepositWithdrawal',
  action: type.enumerated(...tradeHistoryActionValues).brand('TradeHistoryAction'),
  market: 'string',
  marketTokenAmount: 'string | null',
  longTokenAmount: 'string',
  shortTokenAmount: 'string',
  executionFee: 'string',
  createdAt: 'number',
  txHash: 'string',
})

const depositWithdrawalHistoryResponse = type({
  page: 'number',
  limit: 'number',
  count: 'number',
  totalPages: 'number',
  data: depositWithdrawalHistory.array(),
})

export type DepositWithdrawalHistoryData = typeof depositWithdrawalHistoryResponse.infer

export default async function fetchDepositWithdrawalHistories(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
): Promise<DepositWithdrawalHistoryData> {
  if (!accountAddress) {
    return {page, limit, count: 0, totalPages: 0, data: []}
  }

  const params = new URLSearchParams({page: page.toString(), limit: limit.toString()})

  actions.forEach(action => {
    params.append('actions', action.toString())
  })
  markets.forEach(market => {
    params.append('markets', market)
  })

  const query = params.toString()
  const url = `/api/v1/accounts/${accountAddress}/deposit-withdrawal-history`
  const endpoint = query ? `${url}?${query}` : url

  const response = await call.get(endpoint)

  const data = depositWithdrawalHistoryResponse(response.data)

  if (data instanceof type.errors) {
    throw new Error('Invalid deposit/withdrawal history data received from API')
  }

  data.data.sort((a, b) => {
    const result = b.createdAt - a.createdAt
    if (result === 0) {
      return b.action - a.action
    }
    return result
  })

  return data
}
