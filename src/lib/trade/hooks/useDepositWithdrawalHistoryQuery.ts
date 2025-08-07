import type {UseInfiniteQueryOptions, UseQueryOptions} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchDepositWithdrawalHistories, {
  type DepositWithdrawalHistoryData,
} from '@/lib/trade/services/fetchDepositWithdrawalHistories'
import type {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'

export function getDepositWithdrawalHistoryQueryKey(params: {
  chainId: StarknetChainId
  accountAddress: string | undefined
  actions: TradeHistoryAction[]
  markets: string[]
  page: number
  limit: number
}) {
  return [
    'deposit-withdrawal-history',
    params.chainId,
    params.accountAddress,
    params.actions,
    params.markets,
    params.page,
    params.limit,
  ] as const
}

export function getDepositWithdrawalHistoryQueryOptions<
  TData = DepositWithdrawalHistoryData,
  TError = Error,
>(
  params: Parameters<typeof getDepositWithdrawalHistoryQueryKey>[0],
  options?: Omit<
    UseQueryOptions<DepositWithdrawalHistoryData, TError, TData>,
    'queryKey' | 'queryFn'
  >,
) {
  return queryOptions({
    queryKey: getDepositWithdrawalHistoryQueryKey(params),
    queryFn: async () =>
      fetchDepositWithdrawalHistories(
        params.chainId,
        params.accountAddress,
        params.actions,
        params.markets,
        params.page,
        params.limit,
      ),
    refetchInterval: 10000,
    ...options,
  })
}

export function getDepositWithdrawalHistoryInfiniteQueryOptions<
  TData = DepositWithdrawalHistoryData,
  TError = Error,
>(
  params: {
    chainId: StarknetChainId
    accountAddress: string | undefined
    actions: TradeHistoryAction[]
    markets: string[]
    limit: number
  },
  options?: Omit<
    UseInfiniteQueryOptions<DepositWithdrawalHistoryData, TError, TData, unknown[], {page: number}>,
    'queryKey' | 'queryFn'
  >,
) {
  return infiniteQueryOptions({
    queryKey: [
      'deposit-withdrawal-history',
      params.chainId,
      params.accountAddress,
      params.actions,
      params.markets,
      params.limit,
    ],
    initialPageParam: {
      page: 1,
    },
    queryFn: async ({pageParam}) =>
      fetchDepositWithdrawalHistories(
        params.chainId,
        params.accountAddress,
        params.actions,
        params.markets,
        pageParam.page,
        params.limit,
      ),
    refetchInterval: 10000,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.totalPages === lastPage.page) return undefined
      return {
        page: lastPageParam.page + 1,
      }
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam.page === 1) return undefined
      return {
        page: firstPageParam.page - 1,
      }
    },
    ...options,
  })
}

export default function useDepositWithdrawalHistoryQuery(
  actions: TradeHistoryAction[],
  markets: string[],
  page: number,
  limit: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(
    getDepositWithdrawalHistoryQueryOptions({
      chainId,
      accountAddress,
      actions,
      markets,
      page,
      limit,
    }),
  )
}

export function useDepositWithdrawalHistoryInfiniteQuery(
  actions: TradeHistoryAction[],
  markets: string[],
  limit: number,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useInfiniteQuery(
    getDepositWithdrawalHistoryInfiniteQueryOptions({
      chainId,
      accountAddress,
      actions,
      markets,
      limit,
    }),
  )
}
