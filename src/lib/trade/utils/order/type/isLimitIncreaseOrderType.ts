import {OrderType} from 'satoru-sdk'

export function isLimitIncreaseOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitIncrease
}
