import type {QueryClient} from '@tanstack/react-query'
import {queryOptions, skipToken, useQuery, useQueryClient} from '@tanstack/react-query'
import {usePreviousDistinct} from 'react-use'
import type {StarknetChainId} from 'satoru-sdk'
import type {WalletAccount} from 'starknet'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasPriceQueryKey(chainId: StarknetChainId) {
  return ['gasPrice', chainId] as const
}

function createGetGasPriceQueryOptions(
  wallet: WalletAccount | undefined,
  chainId: StarknetChainId,
  previousChainId: StarknetChainId | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- wallet constantly changes
    queryKey: getGasPriceQueryKey(chainId),
    queryFn: wallet
      ? async () => {
          return await fetchGasPrice(wallet)
        }
      : skipToken,
    placeholderData: () => {
      if (!previousChainId) return undefined
      return queryClient.getQueryData<Awaited<ReturnType<typeof fetchGasPrice>>>(
        getGasPriceQueryKey(previousChainId),
      )
    },
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useGasPrice() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
  const previousChainId = usePreviousDistinct(chainId)
  const queryClient = useQueryClient()
  const {data} = useQuery(
    createGetGasPriceQueryOptions(walletAccount, chainId, previousChainId, queryClient),
  )
  return data
}
