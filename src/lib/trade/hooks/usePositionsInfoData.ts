import useChainId from '@/lib/starknet/hooks/useChainId'
import getPositionsInfo from '@/lib/trade/utils/position/getPositionsInfo'

import useMarketsData from './useMarketsData'
import usePositionConstants from './usePositionConstants'
import usePositionsData from './usePositionsData'
import useReferralInfo from './useReferralInfo'
import useTokenPrices from './useTokenPrices'
import useUiFeeFactor from './useUiFeeFactor'

export default function usePositionsInfoData() {
  const [chainId] = useChainId()
  const marketsData = useMarketsData()
  const positionsData = usePositionsData()
  const positionConstants = usePositionConstants()
  const uiFeeFactor = useUiFeeFactor()
  const referralInfo = useReferralInfo()
  const tokenPricesData = useTokenPrices(data => data)

  let positionsInfoData

  if (
    marketsData &&
    tokenPricesData &&
    positionsData &&
    positionConstants &&
    uiFeeFactor !== undefined
  ) {
    positionsInfoData = getPositionsInfo(
      chainId,
      marketsData,
      tokenPricesData,
      positionsData,
      positionConstants,
      uiFeeFactor,
      true,
      referralInfo,
    )
  }

  return positionsInfoData
}
