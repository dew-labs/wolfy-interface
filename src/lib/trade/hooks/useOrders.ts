import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchOrders from '@/lib/trade/services/fetchOrders'
import type {TokensData} from '@/lib/trade/services/fetchTokensData'
import getOrdersInfo from '@/lib/trade/utils/order/getOrdersInfo'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarketsData from './useMarketsData'
import useTokensData from './useTokensData'

function createGetOrdersQueryOptions(
  chainId: StarknetChainId,
  marketsData: MarketsData | undefined,
  tokensData: TokensData | undefined,
  accountAddress: string | undefined,
) {
  return queryOptions({
    queryKey: ['orders', chainId, marketsData, tokensData, accountAddress] as const,
    queryFn:
      marketsData && tokensData
        ? async () => {
            const orders = await fetchOrders(chainId, accountAddress)
            const ordersInfo = getOrdersInfo(marketsData, tokensData, orders)
            return Array.from(ordersInfo.values()).filter(order => isPositionOrder(order))
          }
        : skipToken,
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useOrders() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const marketsData = useMarketsData()
  const tokensData = useTokensData()
  const {data} = useQuery(
    createGetOrdersQueryOptions(chainId, marketsData, tokensData, accountAddress),
  )
  return data
}
