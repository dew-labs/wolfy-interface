import type {OrderInfo, PositionOrderInfo} from '@/lib/trade/utils/order/getOrdersInfo'

import {isLimitOrderType} from './isLimitOrderType'
import {isTriggerDecreaseOrderType} from './isTriggerDecreaseOrderType'

export default function isPositionOrder(order: OrderInfo): order is PositionOrderInfo {
  return isLimitOrderType(order.orderType) || isTriggerDecreaseOrderType(order.orderType)
}
