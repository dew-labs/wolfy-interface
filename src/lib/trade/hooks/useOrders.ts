import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchOrders from '@/lib/trade/services/fetchOrders'
import getOrdersInfo from '@/lib/trade/utils/order/getOrdersInfo'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'

import useMarketsData from './useMarketsData'
import useTokenPrices from './useTokenPrices'

function createGetOrdersQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: ['orders', chainId, accountAddress] as const,
    queryFn: async () => {
      return await fetchOrders(chainId, accountAddress)
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
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
