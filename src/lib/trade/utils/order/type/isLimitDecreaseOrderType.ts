import {OrderType} from 'wolfy-sdk'

export function isLimitDecreaseOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitDecrease
}
