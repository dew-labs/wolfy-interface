import type {Order} from '@/lib/trade/services/fetchOrders'
import type {PositionOrderInfo} from '@/lib/trade/utils/order/getOrdersInfo'

import {isLimitOrderType} from './isLimitOrderType'
import {isTriggerDecreaseOrderType} from './isTriggerDecreaseOrderType'

export default function isPositionOrder(order: Order): order is PositionOrderInfo {
  return isLimitOrderType(order.orderType) || isTriggerDecreaseOrderType(order.orderType)
}
