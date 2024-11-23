import {OrderType} from 'wolfy-sdk'

export function isLimitSwapOrderType(orderType: OrderType) {
  return orderType === OrderType.LimitSwap
}
