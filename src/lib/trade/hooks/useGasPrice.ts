import type {WalletAccount} from 'starknet'
import {type StarknetChainId} from 'wolfy-sdk'

import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import fetchGasPrice from '@/lib/trade/services/fetchGasPrice'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

export function getGasPriceQueryKey(chainId: StarknetChainId, walletAccount?: WalletAccount) {
  return ['gasPrice', chainId, walletAccount?.address] as const
}

function createGetGasPriceQueryOptions(
  wallet: WalletAccount | undefined,
  chainId: StarknetChainId,
) {
  return queryOptions({
    queryKey: getGasPriceQueryKey(chainId, wallet),
    queryFn: wallet
      ? async () => {
          return await fetchGasPrice(chainId, wallet)
        }
      : skipToken,
    placeholderData: previousData => previousData ?? 0n,
    ...NO_REFETCH_OPTIONS,
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false,
  })
}

export default function useGasPrice() {
  const [walletAccount] = useWalletAccount()
  const [chainId] = useChainId()

  return useQuery(createGetGasPriceQueryOptions(walletAccount, chainId))
}
