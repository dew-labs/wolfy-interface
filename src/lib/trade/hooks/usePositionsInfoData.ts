import type {UseQueryResult} from '@tanstack/react-query'

import useChainId from '@/lib/starknet/hooks/useChainId'
import type {PositionsData} from '@/lib/trade/services/fetchPositions'
import getPositionsInfo, {type PositionsInfoData} from '@/lib/trade/utils/position/getPositionsInfo'

import useMarketsData from './useMarketsData'
import usePositionConstants from './usePositionConstants'
import usePositionsData from './usePositionsData'
import useReferralInfo from './useReferralInfo'
import useTokenPrices from './useTokenPrices'
import useUiFeeFactor from './useUiFeeFactor'

export default function usePositionsInfoData(): UseQueryResult<PositionsInfoData>
export default function usePositionsInfoData<T = PositionsInfoData>(
  selector: (data: PositionsInfoData) => T,
): UseQueryResult<T>
export default function usePositionsInfoData<T = PositionsInfoData>(
  selector?: (data: PositionsInfoData) => T,
) {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsData()
  const {data: positionConstants} = usePositionConstants()
  const {data: uiFeeFactor} = useUiFeeFactor()
  const {data: referralInfo} = useReferralInfo()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPrices()

  return usePositionsData((positionsData: PositionsData) => {
    if (!marketsData || !tokenPricesData || !positionConstants || !uiFeeFactor || !referralInfo)
      return undefined

    const data = getPositionsInfo(
      chainId,
      marketsData,
      tokenPricesData,
      positionsData,
      positionConstants,
      uiFeeFactor,
      true,
      referralInfo,
    )

    if (selector) return selector(data)
    return data
  })
}
