import useChainId from '@/lib/starknet/hooks/useChainId'
import getOrdersInfo, {type OrderInfosData} from '@/lib/trade/utils/order/getOrdersInfo'

import useMarketsData from './useMarketsData'
import useOrdersData from './useOrdersData'
import useTokenPrices from './useTokenPrices'

export default function useOrdersInfosData(): UseQueryResult<OrderInfosData>
export default function useOrdersInfosData<T = OrderInfosData>(
  selector: MemoizedCallback<(data: OrderInfosData) => T>,
): UseQueryResult<T>
export default function useOrdersInfosData<T = OrderInfosData>(
  selector?: MemoizedCallback<(data: OrderInfosData) => T>,
) {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsData()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPrices()

  return useOrdersData(
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
