import {OrderType} from 'wolfy-sdk'

export function isIncreaseOrderType(
  orderType: OrderType,
): orderType is typeof OrderType.MarketIncrease | typeof OrderType.LimitIncrease {
  return [OrderType.MarketIncrease, OrderType.LimitIncrease].includes(orderType)
}
