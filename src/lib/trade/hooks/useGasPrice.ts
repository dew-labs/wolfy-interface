import {queryOptions, skipToken, useQuery} from '@tanstack/react-query'
import type {WalletAccount} from 'starknet'

import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'

function createGetGasPriceQueryOptions(wallet: WalletAccount | undefined) {
  return queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- wallet constantly changes
    queryKey: ['gasPrice'],
    queryFn: wallet
      ? async () => {
          return await fetchGasPrice(wallet)
        }
      : skipToken,
    refetchInterval: 60000, // 1 minute
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export default function useGasPrice() {
  const [walletAccount] = useWalletAccount()
  const {data} = useQuery(createGetGasPriceQueryOptions(walletAccount))
  return data
}
