import {OrderType} from 'wolfy-sdk'

export default function isSwapOrderType(orderType: OrderType) {
  return [OrderType.MarketSwap, OrderType.LimitSwap].includes(orderType)
}
