import {LEVERAGE_PRECISION} from '@/constants/config'

import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'

export default function getLeverage(p: {
  sizeInUsd: bigint
  collateralUsd: bigint
  pnl: bigint | undefined
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
}) {
  const {pnl, sizeInUsd, collateralUsd, pendingBorrowingFeesUsd, pendingFundingFeesUsd} = p

  const totalPendingFeesUsd = getPositionPendingFeesUsd({
    pendingFundingFeesUsd,
    pendingBorrowingFeesUsd,
  })

  const remainingCollateralUsd = collateralUsd + (pnl ?? 0n) - totalPendingFeesUsd

  if (remainingCollateralUsd <= 0) {
    return undefined
  }

  return (sizeInUsd * LEVERAGE_PRECISION) / remainingCollateralUsd
}
