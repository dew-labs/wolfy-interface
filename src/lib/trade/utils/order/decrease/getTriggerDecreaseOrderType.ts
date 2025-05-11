import {OrderType} from 'wolfy-sdk'

export default function getTriggerDecreaseOrderType(p: {
  triggerPrice: bigint
  markPrice: bigint
  isLong: boolean
}): typeof OrderType.LimitDecrease | typeof OrderType.StopLossDecrease {
  const {triggerPrice, markPrice, isLong} = p

  const isTriggerAboveMarkPrice = triggerPrice > markPrice

  if (isTriggerAboveMarkPrice) {
    return isLong ? OrderType.LimitDecrease : OrderType.StopLossDecrease
  }

  return isLong ? OrderType.StopLossDecrease : OrderType.LimitDecrease
}
