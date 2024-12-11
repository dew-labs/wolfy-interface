import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'

export interface FeeItem {
  deltaUsd: bigint
  bps: bigint
}

export function getFeeItem(
  feeDeltaUsd?: bigint,
  basis?: bigint,
  opts: {shouldRoundUp?: boolean} = {},
): FeeItem | undefined {
  const {shouldRoundUp = false} = opts
  if (feeDeltaUsd === undefined) return undefined

  return {
    deltaUsd: feeDeltaUsd,
    bps: basis !== undefined && basis > 0 ? getBasisPoints(feeDeltaUsd, basis, shouldRoundUp) : 0n,
  }
}
