import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchDepositWithdrawalHistories, {
  type DepositWithdrawalHistoryData,
} from '@/lib/trade/services/fetchDepositWithdrawalHistories'
import type {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'

export default function useDepositWithdrawalHistoryQuery(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
): UseQueryResult<DepositWithdrawalHistoryData>
export default function useDepositWithdrawalHistoryQuery<T = DepositWithdrawalHistoryData>(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
  selector: MemoizedCallback<(data: DepositWithdrawalHistoryData) => T>,
): UseQueryResult<T>
export default function useDepositWithdrawalHistoryQuery(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  pageSize: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

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
