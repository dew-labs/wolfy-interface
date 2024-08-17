export default function getPositionPendingFeesUsd(p: {
  pendingFundingFeesUsd: bigint
  pendingBorrowingFeesUsd: bigint
}) {
  const {pendingFundingFeesUsd, pendingBorrowingFeesUsd} = p

  return pendingBorrowingFeesUsd + pendingFundingFeesUsd
}
