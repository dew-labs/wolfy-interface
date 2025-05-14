import {OrderType} from 'wolfy-sdk'

export function isDecreaseOrderType(orderType: OrderType) {
  return [OrderType.MarketDecrease, OrderType.LimitDecrease, OrderType.StopLossDecrease].includes(
    orderType,
  )
}
