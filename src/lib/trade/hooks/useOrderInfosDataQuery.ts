import useChainId from '@/lib/starknet/hooks/useChainId'
import getOrdersInfo, {type OrderInfosData} from '@/lib/trade/utils/order/getOrdersInfo'

import useMarketsDataQuery from './useMarketsDataQuery'
import useOrdersDataQuery from './useOrdersDataQuery'
import useTokenPricesQuery from './useTokenPricesQuery'

export default function useOrdersInfosDataQuery(): UseQueryResult<OrderInfosData>
export default function useOrdersInfosDataQuery<T = OrderInfosData>(
  selector: MemoizedCallback<(data: OrderInfosData) => T>,
): UseQueryResult<T>
export default function useOrdersInfosDataQuery<T = OrderInfosData>(
  selector?: MemoizedCallback<(data: OrderInfosData) => T>,
) {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsDataQuery()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPricesQuery()

  return useOrdersDataQuery(
    useCallback(
      ordersData => {
        const ordersInfo =
          marketsData && tokenPricesData
            ? getOrdersInfo(chainId, marketsData, ordersData, tokenPricesData)
            : (new Map() as OrderInfosData)
        if (selector) return selector(ordersInfo)
        return ordersInfo
      },
      [chainId, marketsData, selector, tokenPricesData],
    ),
  )
}
