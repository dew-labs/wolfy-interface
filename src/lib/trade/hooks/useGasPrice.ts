import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {StarknetChainId} from 'satoru-sdk'
import type {WalletAccount} from 'starknet'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetGasPriceQueryOptions(
  wallet: WalletAccount | undefined,
  chainId: StarknetChainId,
) {
  return queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- wallet constantly changes
    queryKey: ['gasPrice', chainId],
    queryFn: wallet
      ? async () => {
          return await fetchGasPrice(wallet)
        }
      : skipToken,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useGasPrice() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()
  const {data} = useQuery(createGetGasPriceQueryOptions(walletAccount, chainId))
  return data
}
