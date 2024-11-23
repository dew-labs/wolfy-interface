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
  const {data: marketsData} = useMarketsData()
  const {data: positionConstants} = usePositionConstants()
  const {data: uiFeeFactor} = useUiFeeFactor()
  const {data: referralInfo} = useReferralInfo()
  const {data: tokenPricesData} = useTokenPrices(data => data)

  return usePositionsData(positionsData => {
    if (!marketsData || !tokenPricesData || !positionConstants || uiFeeFactor === undefined) {
      return undefined
    }

    return getPositionsInfo(
      chainId,
      marketsData,
      tokenPricesData,
      positionsData,
      positionConstants,
      uiFeeFactor,
      true,
      referralInfo,
    )
  })
}
