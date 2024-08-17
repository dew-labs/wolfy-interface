import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'

export function getPositionNetValue(p: {
  collateralUsd: bigint
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
  pnl: bigint
  closingFeeUsd: bigint
  uiFeeUsd: bigint
}) {
  const {pnl, closingFeeUsd, collateralUsd, uiFeeUsd} = p

  const pendingFeesUsd = getPositionPendingFeesUsd(p)

  return collateralUsd - pendingFeesUsd - closingFeeUsd - uiFeeUsd + pnl
}
