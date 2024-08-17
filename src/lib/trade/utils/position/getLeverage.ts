import {BASIS_POINTS_DIVISOR_BIGINT} from '@/lib/trade/numbers/constants'

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

  return (sizeInUsd * BASIS_POINTS_DIVISOR_BIGINT) / remainingCollateralUsd
}
