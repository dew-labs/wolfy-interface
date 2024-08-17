import {OrderType} from 'satoru-sdk'

export function isLimitDecreaseOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitDecrease
}
