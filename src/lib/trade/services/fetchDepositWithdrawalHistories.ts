import {type Static, Type} from '@sinclair/typebox'
import {TypeCompiler} from '@sinclair/typebox/compiler'
import type {StarknetChainId} from 'wolfy-sdk'

import call from '@/utils/api/call'

import {TradeHistoryAction} from './fetchTradeHistories'

const DepositWithdrawalHistorySchema = Type.Object({
  id: Type.String(),
  action: Type.Enum(TradeHistoryAction),
  market: Type.String(),
  marketTokenAmount: Type.Union([Type.String(), Type.Null()]),
  longTokenAmount: Type.String(),
  shortTokenAmount: Type.String(),
  executionFee: Type.String(),
  createdAt: Type.Number(),
  txHash: Type.String(),
})

const DepositWithdrawalHistoryResponseSchema = Type.Object({
  page: Type.Number(),
  limit: Type.Number(),
  count: Type.Number(),
  totalPages: Type.Number(),
  data: Type.Array(DepositWithdrawalHistorySchema),
})

export type DepositWithdrawalHistoryData = Static<typeof DepositWithdrawalHistoryResponseSchema>
const depositWithdrawalHistoryResponseCheck = TypeCompiler.Compile(
  DepositWithdrawalHistoryResponseSchema,
)

export function isDepositWithdrawalHistoryData(
  data: unknown,
): data is DepositWithdrawalHistoryData {
  return depositWithdrawalHistoryResponseCheck.Check(data)
}

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

    const query = params.toString()

    const response = await call.get(
      `/api/v1/accounts/${accountAddress}/deposit-withdrawal-history${query ? `?${query}` : ''}`,
    )

    if (!isDepositWithdrawalHistoryData(response.data)) {
      throw new Error('Invalid deposit/withdrawal history data received from API')
    }

    response.data.data.sort((a, b) => {
      const result = b.createdAt - a.createdAt
      if (result === 0) {
        return b.action - a.action
      }
      return result
    })

    return response.data
  } catch (error) {
    console.error('Error fetching deposit/withdrawal histories:', error)
    throw error
  }
}
