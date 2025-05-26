import useChainId from '@/lib/starknet/hooks/useChainId'
import type {PositionsData} from '@/lib/trade/services/fetchPositions'
import getPositionsInfo, {type PositionsInfoData} from '@/lib/trade/utils/position/getPositionsInfo'

import useMarketsDataQuery from './useMarketsDataQuery'
import usePositionConstantsQuery from './usePositionConstantsQuery'
import usePositionsDataQuery from './usePositionsDataQuery'
import useReferralInfoQuery from './useReferralInfoQuery'
import useTokenPricesQuery from './useTokenPricesQuery'
import useUiFeeFactorQuery from './useUiFeeFactorQuery'

export default function usePositionsInfoDataQuery(): UseQueryResult<PositionsInfoData>
export default function usePositionsInfoDataQuery<T = PositionsInfoData>(
  selector: MemoizedCallback<(data: PositionsInfoData) => T>,
): UseQueryResult<T>
export default function usePositionsInfoDataQuery<T = PositionsInfoData>(
  selector?: MemoizedCallback<(data: PositionsInfoData) => T>,
) {
  const [chainId] = useChainId()
  const {data: marketsData} = useMarketsDataQuery()
  const {data: positionConstants} = usePositionConstantsQuery()
  const {data: uiFeeFactor} = useUiFeeFactorQuery()
  const {data: referralInfo} = useReferralInfoQuery()
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPricesData} = useTokenPricesQuery()

  return usePositionsDataQuery(
    useCallback(
      (positionsData: PositionsData) => {
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
      },
      [
        chainId,
        marketsData,
        positionConstants,
        referralInfo,
        tokenPricesData,
        uiFeeFactor,
        selector,
      ],
    ),
  )
}
