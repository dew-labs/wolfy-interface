import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchOrders from '@/lib/trade/services/fetchOrders'
import getOrdersInfo from '@/lib/trade/utils/order/getOrdersInfo'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'
import useTokenPrices from './useTokenPrices'

export function getOrdersQueryKey(chainId: StarknetChainId, accountAddress: string | undefined) {
  return ['orders', chainId, accountAddress] as const
}

function createGetOrdersQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: getOrdersQueryKey(chainId, accountAddress),
    queryFn: async () => {
      return await fetchOrders(chainId, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useOrders() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const tokenPricesData = useTokenPrices(data => data)

  const {data: orders} = useQuery(createGetOrdersQueryOptions(chainId, accountAddress))

  if (!marketsData || !orders || !tokenPricesData) return []

  const ordersInfo = getOrdersInfo(chainId, marketsData, orders, tokenPricesData)
  return Array.from(ordersInfo.values())
    .filter(order => isPositionOrder(order))
    .reverse()
}
