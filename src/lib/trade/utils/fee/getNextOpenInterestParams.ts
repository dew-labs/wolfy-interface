export default function getNextOpenInterestParams(p: {
  currentLongUsd: bigint
  currentShortUsd: bigint
  usdDelta: bigint
  isLong: boolean
}) {
  const {currentLongUsd, currentShortUsd, usdDelta, isLong} = p

  let nextLongUsd = currentLongUsd
  let nextShortUsd = currentShortUsd

  if (isLong) {
    nextLongUsd = currentLongUsd + usdDelta
  } else {
    nextShortUsd = currentShortUsd + usdDelta
  }

  return {
    currentLongUsd,
    currentShortUsd,
    nextLongUsd,
    nextShortUsd,
  }
}
