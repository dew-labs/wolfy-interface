import {OrderType} from 'wolfy-sdk'

export function isMarketOrderType(orderType: OrderType) {
  return [OrderType.MarketDecrease, OrderType.MarketIncrease, OrderType.MarketSwap].includes(
    orderType,
  )
}
