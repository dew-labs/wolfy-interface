import {useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {MemoizedCallback} from 'react'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchDepositWithdrawalHistories, {
  type DepositWithdrawalHistoryData,
} from '@/lib/trade/services/fetchDepositWithdrawalHistories'
import {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'

export default function useDepositWithdrawalHistory(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
): UseQueryResult<DepositWithdrawalHistoryData>
export default function useDepositWithdrawalHistory<T = DepositWithdrawalHistoryData>(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
  selector: MemoizedCallback<(data: DepositWithdrawalHistoryData) => T>,
): UseQueryResult<T>
export default function useDepositWithdrawalHistory(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  pageSize: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  return useQuery({
    queryKey: [
      'deposit-withdrawal-history',
      chainId,
      accountAddress,
      actions,
      markets,
      page,
      pageSize,
    ],
    queryFn: async () =>
      fetchDepositWithdrawalHistories(chainId, accountAddress, actions, markets, page, pageSize),
    refetchInterval: 10000,
  })
}
