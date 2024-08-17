import {OrderType} from 'satoru-sdk'

export function isLiquidationOrderType(orderType: OrderType) {
  return orderType === OrderType.Liquidation
}
