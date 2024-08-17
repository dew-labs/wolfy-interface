import {OrderType} from 'satoru-sdk'

export enum TriggerThresholdType {
  Above = '>',
  Below = '<',
}

export default function getTriggerThresholdType(orderType: OrderType, isLong: boolean) {
  console.log(orderType)

  // limit order
  if (orderType === OrderType.LimitIncrease) {
    return isLong ? TriggerThresholdType.Below : TriggerThresholdType.Above
  }

  // take profit order
  if (orderType === OrderType.LimitDecrease) {
    return isLong ? TriggerThresholdType.Above : TriggerThresholdType.Below
  }

  // stop loss order
  if (orderType === OrderType.StopLossDecrease) {
    return isLong ? TriggerThresholdType.Below : TriggerThresholdType.Above
  }

  throw new Error('Invalid trigger order type')
}
