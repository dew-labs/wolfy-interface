import {OrderType} from 'satoru-sdk'

export function isLimitSwapOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitSwap
}
