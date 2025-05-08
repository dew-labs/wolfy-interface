import {type} from 'arktype'
import {isResponseError, isValidationError} from 'up-fetch'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'
import tryCatch from '@/utils/tryCatch'

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

  const [result, error] = await tryCatch(
    call(`/api/v1/accounts/${accountAddress}/deposit-withdrawal-history`, {
      params: {page, limit, actions, markets},
      schema: depositWithdrawalHistoryResponse,
    }),
  )

  if (error) {
    if (isValidationError(error)) {
      console.log(error.issues)
    }

    if (isResponseError(error)) {
      console.log(error)
    }

    throw new Error('Invalid deposit/withdrawal history data received from API')
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
