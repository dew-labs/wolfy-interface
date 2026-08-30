import {useAccountAddressValue} from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import getOrdersInfo, {type OrderInfosData} from '@/lib/trade/utils/order/getOrdersInfo'

import useMarketsDataQuery from './useMarketsDataQuery'
import {getOrdersDataQueryOptions} from './useOrdersDataQuery'
import useTokenPricesQuery from './useTokenPricesQuery'

export default function useOrdersInfosDataQuery(): UseQueryResult<OrderInfosData>
export default function useOrdersInfosDataQuery<T = OrderInfosData>(
  selector: (data: OrderInfosData) => T,
): UseQueryResult<T>
export default function useOrdersInfosDataQuery<T = OrderInfosData>(
  selector?: (data: OrderInfosData) => T,
) {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsDataQuery()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPricesQuery()
  const accountAddress = useAccountAddressValue()

  return useQuery(
    getOrdersDataQueryOptions(
      {chainId, accountAddress},
      {
        select: useCallback(
          ordersData => {
            const ordersInfo: OrderInfosData =
              marketsData && tokenPricesData
                ? getOrdersInfo(chainId, marketsData, ordersData, tokenPricesData)
                : new Map()
            if (selector) return selector(ordersInfo)
            return ordersInfo
          },
          [chainId, marketsData, selector, tokenPricesData],
        ),
      },
    ),
  )
}
