import {useCallback, useMemo, useState} from 'react'
import {useLatest} from 'react-use'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

export default function useToken(tradeMode: TradeMode) {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const [tokenAddress] = useTokenAddress()
  const {data: tokenMinPriceData} = useTokenPrices(data => data.get(tokenAddress ?? '')?.min)

  const tokenData = tokenAddress ? tokensMetadata.get(tokenAddress) : undefined
  const tokenDecimals = tokenData?.decimals ?? 0
  const latestTokenDecimals = useLatest(tokenDecimals)

  const [tokenAmountUsd, setTokenAmountUsd] = useState(0n)
  const latestTokenAmountUsd = useLatest(tokenAmountUsd)
  const [tokenPrice, setTokenPrice] = useState<bigint>()
  const derivedTokenPrice =
    tokenPrice && tradeMode !== TradeMode.Market ? tokenPrice : (tokenMinPriceData ?? 0n) // TODO: market shouldn't use min price?
  const latestDerivedTokenPrice = useLatest(derivedTokenPrice)

  const tokenAmount = useMemo(() => {
    if (!derivedTokenPrice) return 0n
    return convertUsdToTokenAmount(tokenAmountUsd, tokenDecimals, latestDerivedTokenPrice.current)
  }, [derivedTokenPrice, tokenAmountUsd, tokenDecimals])

  const setTokenAmount = useCallback(
    (tokenAmount: bigint) => {
      const tokenAmountUsd = convertTokenAmountToUsd(
        tokenAmount,
        tokenDecimals,
        latestDerivedTokenPrice.current,
      )
      setTokenAmountUsd(tokenAmountUsd)
    },
    [tokenDecimals],
  )

  return {
    tokenAddress,
    tokenData,
    tokenAmount,
    tokenAmountUsd,
    latestTokenAmountUsd,
    setTokenAmount,
    tokenPrice,
    derivedTokenPrice,
    latestDerivedTokenPrice,
    setTokenPrice,
    setTokenAmountUsd,
    tokenDecimals,
    latestTokenDecimals,
  }
}
