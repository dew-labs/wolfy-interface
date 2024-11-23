import {OrderType} from 'wolfy-sdk'

export function isLiquidationOrderType(orderType: OrderType) {
  return orderType === OrderType.Liquidation
}
