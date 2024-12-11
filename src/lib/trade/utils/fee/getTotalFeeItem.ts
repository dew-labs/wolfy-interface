import type {FeeItem} from './getFeeItem'

export function getTotalFeeItem(feeItems: (FeeItem | undefined)[]): FeeItem {
  const totalFeeItem: FeeItem = {
    deltaUsd: 0n,
    bps: 0n,
  }

  feeItems.filter(Boolean).forEach(feeItem => {
    totalFeeItem.deltaUsd = totalFeeItem.deltaUsd + feeItem.deltaUsd
    totalFeeItem.bps = totalFeeItem.bps + feeItem.bps
  })

  return totalFeeItem
}
