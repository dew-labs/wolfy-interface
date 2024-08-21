import {useCallback, useMemo, useState} from 'react'
import {useLatest} from 'react-use'

import useTokensData from '@/lib/trade/hooks/useTokensData'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'

export default function useToken(tradeMode: TradeMode) {
  const tokensData = useTokensData()
  const [tokenAddress] = useTokenAddress()
  const tokenData = tokenAddress ? tokensData?.get(tokenAddress) : undefined
  const tokenDecimals = tokenData?.decimals ?? 0
  const latestTokenDecimals = useLatest(tokenDecimals)

  const [tokenAmountUsd, setTokenAmountUsd] = useState(0n)
  const latestTokenAmountUsd = useLatest(tokenAmountUsd)
  const [tokenPrice, setTokenPrice] = useState<bigint>()
  const derivedTokenPrice =
    tokenPrice && tradeMode !== TradeMode.Market ? tokenPrice : (tokenData?.price.min ?? 0n)
  const latestDerivedTokenPrice = useLatest(derivedTokenPrice)

  const tokenAmount = useMemo(() => {
    if (!derivedTokenPrice) return 0n
    return convertUsdToTokenAmount(tokenAmountUsd, tokenDecimals, derivedTokenPrice)
  }, [derivedTokenPrice, tokenAmountUsd, tokenDecimals])

  const setTokenAmount = useCallback(
    (tokenAmount: bigint) => {
      const tokenAmountUsd = convertTokenAmountToUsd(tokenAmount, tokenDecimals, derivedTokenPrice)
      setTokenAmountUsd(tokenAmountUsd)
    },
    [derivedTokenPrice, tokenDecimals],
  )

  return {
    tokenAddress,
    tokenData,
    tokenAmount,
    tokenAmountUsd,
    latestTokenAmountUsd,
    setTokenAmount,
    tokenPrice,
    latestDerivedTokenPrice,
    setTokenPrice,
    setTokenAmountUsd,
    tokenDecimals,
    latestTokenDecimals,
  }
}
