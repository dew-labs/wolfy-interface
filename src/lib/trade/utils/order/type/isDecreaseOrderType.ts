import {OrderType} from 'satoru-sdk'

export function isDecreaseOrderType(orderType: OrderType) {
  return [OrderType.MarketDecrease, OrderType.LimitDecrease, OrderType.StopLossDecrease].includes(
    orderType,
  )
}
