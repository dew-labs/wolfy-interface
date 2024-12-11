import {OrderType} from 'wolfy-sdk'

export function isStopLossOrderType(orderType: OrderType) {
  return orderType === OrderType.StopLossDecrease
}
