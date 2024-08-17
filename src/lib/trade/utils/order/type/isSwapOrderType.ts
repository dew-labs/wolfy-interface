import {OrderType} from 'satoru-sdk'

export default function isSwapOrderType(orderType: OrderType) {
  return [OrderType.MarketSwap, OrderType.LimitSwap].includes(orderType)
}
