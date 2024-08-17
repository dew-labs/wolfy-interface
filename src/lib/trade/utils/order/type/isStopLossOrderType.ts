import {OrderType} from 'satoru-sdk'

export function isStopLossOrderType(orderType: OrderType) {
  return orderType === OrderType.StopLossDecrease
}
