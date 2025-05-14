import invariant from 'tiny-invariant'

import {FEE_TOKEN_ADDRESS, getTokenMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import {DEFAULT_PRICE} from '@/lib/trade/services/fetchTokenPrices'

import useTokenPrices from './useTokenPrices'

export default function useFeeToken() {
  const [chainId] = useChainId()
  const feeTokenAddress = FEE_TOKEN_ADDRESS.get(chainId)
  invariant(feeTokenAddress, `No fee token found for chainId ${chainId}`)

  const feeToken = getTokenMetadata(chainId, feeTokenAddress)

  const {data: feeTokenPrice = DEFAULT_PRICE} = useTokenPrices(
    useCallback(data => data.get(feeTokenAddress), [feeTokenAddress]),
  )

  return {feeToken, feeTokenPrice}
}
