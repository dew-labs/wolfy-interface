import abs from '@/utils/numbers/bigint/abs'

import getNextOpenInterestParams from './getNextOpenInterestParams'

export default function getNextOpenInterestForVirtualInventory(p: {
  virtualInventory: bigint
  usdDelta: bigint
  isLong: boolean
}) {
  const {virtualInventory, usdDelta, isLong} = p

  let currentLongUsd = 0n
  let currentShortUsd = 0n

  if (virtualInventory > 0) {
    currentShortUsd = virtualInventory
  } else {
    currentLongUsd = virtualInventory * -1n
  }

  if (usdDelta < 0) {
    const offset = abs(usdDelta)
    currentLongUsd = currentLongUsd + offset
    currentShortUsd = currentShortUsd + offset
  }

  return getNextOpenInterestParams({currentLongUsd, currentShortUsd, usdDelta, isLong})
}
