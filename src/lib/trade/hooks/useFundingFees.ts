import {useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {MemoizedCallback} from 'react'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import type {FundingFeeData} from '@/lib/trade/services/fetchFundingFee'
import fetchFundingFees, {type FundingFeesData} from '@/lib/trade/services/fetchFundingFees'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

import useMarkets from './useMarkets'

export default function useFundingFees(): UseQueryResult<FundingFeesData>
export default function useFundingFees<T = FundingFeesData>(
  selector: MemoizedCallback<(data: FundingFeesData) => T>,
): UseQueryResult<T>
export default function useFundingFees() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()
  const {data: markets} = useMarkets()

  return useQuery({
    queryKey: ['fundingFees', chainId, accountAddress, markets],
    queryFn: async () => {
      if (!markets || !accountAddress) {
        return new Map<string, FundingFeeData>()
      }

      return fetchFundingFees(chainId, markets, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
