import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokensData from '@/lib/trade/services/fetchTokensData'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetTokensQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: ['tokens', chainId, accountAddress],
    queryFn: async () => {
      return await fetchTokensData(chainId, accountAddress)
    },
    ...NO_REFETCH_OPTIONS,
  })
}

export default function useTokensData() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  const {data: tokensData} = useQuery(createGetTokensQueryOptions(chainId, accountAddress))

  return tokensData
}
