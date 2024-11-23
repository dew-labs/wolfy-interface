import {OrderType} from 'wolfy-sdk'

export function isLimitIncreaseOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitIncrease
}
