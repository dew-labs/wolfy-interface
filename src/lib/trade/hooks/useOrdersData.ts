import type {StarknetChainId} from 'wolfy-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchOrders, {type OrdersData} from '@/lib/trade/services/fetchOrders'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getOrdersDataQueryKey(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
) {
  return ['ordersData', chainId, accountAddress] as const
}

function createGetOrdersDataQueryOptions<T>(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  selector: MemoizedCallback<(data: OrdersData) => T>,
) {
  return queryOptions({
    queryKey: getOrdersDataQueryKey(chainId, accountAddress),
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

export default function useOrdersData(): UseQueryResult<OrdersData>
export default function useOrdersData<T = OrdersData>(
  selector: MemoizedCallback<(data: OrdersData) => T>,
): UseQueryResult<T>
export default function useOrdersData<T = OrdersData>(
  selector?: MemoizedCallback<(data: OrdersData) => T>,
) {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  return useQuery(
    createGetOrdersDataQueryOptions(
      chainId,
      accountAddress,
      useCallback(
        ordersData => {
          if (selector) return selector(ordersData)
          return ordersData
        },
        [selector],
      ),
    ),
  )
}
