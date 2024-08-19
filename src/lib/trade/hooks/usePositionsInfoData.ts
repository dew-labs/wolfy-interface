import getPositionsInfo from '@/lib/trade/utils/position/getPositionsInfo'

import useMarketsData from './useMarketsData'
import usePositionConstants from './usePositionConstants'
import usePositionsData from './usePositionsData'
import useReferralInfo from './useReferralInfo'
import useTokensData from './useTokensData'
import useUiFeeFactor from './useUiFeeFactor'

export default function usePositionsInfoData() {
  let positionsInfoData

  const marketsData = useMarketsData()
  const tokensData = useTokensData()
  const positionsData = usePositionsData()
  const positionConstants = usePositionConstants()
  const uiFeeFactor = useUiFeeFactor()
  const referralInfo = useReferralInfo()

  if (
    marketsData &&
    tokensData &&
    positionsData &&
    positionConstants &&
    uiFeeFactor !== undefined
  ) {
    positionsInfoData = getPositionsInfo(
      marketsData,
      tokensData,
      positionsData,
      positionConstants,
      uiFeeFactor,
      true,
      referralInfo,
    )
  }

  return positionsInfoData
}
