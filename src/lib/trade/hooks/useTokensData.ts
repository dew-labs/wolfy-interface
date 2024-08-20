import {queryOptions, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'

import useAccountAddress from '@/lib/starknet/hooks/useAccountAddress'
import useChainId from '@/lib/starknet/hooks/useChainId'
import fetchTokensData from '@/lib/trade/services/fetchTokensData'

function createGetTokensQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: ['tokens', chainId, accountAddress],
    queryFn: async () => {
      return await fetchTokensData(chainId, accountAddress)
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useTokensData() {
  const [chainId] = useChainId()
  const accountAddress = useAccountAddress()

  const {data: tokensData} = useQuery(createGetTokensQueryOptions(chainId, accountAddress))

  return tokensData
}
