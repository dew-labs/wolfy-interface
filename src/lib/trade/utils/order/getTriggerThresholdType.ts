import {OrderType} from 'wolfy-sdk'

export const TriggerThresholdType = {
  Above: '>',
  Below: '<',
} as const
export type TriggerThresholdType = (typeof TriggerThresholdType)[keyof typeof TriggerThresholdType]

export default function getTriggerThresholdType(orderType: OrderType, isLong: boolean) {
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
