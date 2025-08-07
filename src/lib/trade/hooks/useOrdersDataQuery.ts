import type {StarknetChainId} from 'wolfy-sdk'

import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchOrders, {type OrdersData} from '@/lib/trade/services/fetchOrders'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getOrdersDataQueryKey(params: {
  chainId: StarknetChainId
  accountAddress: string | undefined
}) {
  return ['ordersData', params.chainId, params.accountAddress] as const
}

export function getOrdersDataQueryOptions<TData = OrdersData, TError = Error>(
  params: Parameters<typeof getOrdersDataQueryKey>[0],
  options?: Omit<UseQueryOptions<OrdersData, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    queryKey: getOrdersDataQueryKey(params),
    queryFn: async () => {
      return await fetchOrders(params.chainId, params.accountAddress)
    },
    placeholderData: keepPreviousData,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export default function useOrdersDataQuery() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddressValue()

  return useQuery(getOrdersDataQueryOptions({chainId, accountAddress}))
}
