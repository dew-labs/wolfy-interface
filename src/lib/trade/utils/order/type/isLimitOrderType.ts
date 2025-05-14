import {OrderType} from 'wolfy-sdk'

export function isLimitOrderType(orderType: OrderType) {
  return [OrderType.LimitIncrease, OrderType.LimitSwap].includes(orderType)
}
