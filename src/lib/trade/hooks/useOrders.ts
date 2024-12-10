import {queryOptions, useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchOrders, {type OrdersData} from '@/lib/trade/services/fetchOrders'
import getOrdersInfo, {
  type OrderInfo,
  type PositionOrderInfo,
} from '@/lib/trade/utils/order/getOrdersInfo'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'
import useTokenPrices from './useTokenPrices'

export function getOrdersQueryKey(chainId: StarknetChainId, accountAddress: string | undefined) {
  return ['orders', chainId, accountAddress] as const
}

function createGetOrdersQueryOptions<T>(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  selector: (data: OrdersData) => T,
) {
  return queryOptions({
    queryKey: getOrdersQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchOrders(chainId, accountAddress)
    },
    placeholderData: previousData => previousData,
    ...NO_REFETCH_OPTIONS,
    select: selector,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useOrders(): UseQueryResult<PositionOrderInfo[]>
export default function useOrders<T = OrderInfo[]>(
  selector: (data: OrderInfo[]) => T,
): UseQueryResult<T>
export default function useOrders<T = OrderInfo[]>(selector?: (data: OrderInfo[]) => T) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const {data: marketsData} = useMarketsData()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPrices()

  return useQuery(
    createGetOrdersQueryOptions(chainId, accountAddress, ordersData => {
      if (!marketsData || !tokenPricesData) return []
      const ordersInfo = getOrdersInfo(chainId, marketsData, ordersData, tokenPricesData)
      const orders = Array.from(ordersInfo.values()).reverse()

      if (selector) return selector(orders)

      // Default to show only position orders
      return orders.filter(order => isPositionOrder(order))
    }),
  )
}
