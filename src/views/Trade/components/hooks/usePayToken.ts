import {type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState} from 'react'
import {useLatest} from 'react-use'

import {LEVERAGE_DECIMALS, LEVERAGE_PRECISION} from '@/constants/config'
import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {TradeMode} from '@/lib/trade/states/useTradeMode'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

function calculateLeverage(tokenAmountUsd: bigint, payTokenAmountUsd: bigint) {
  if (tokenAmountUsd <= 0 || payTokenAmountUsd <= 0) return 0n
  return (tokenAmountUsd * LEVERAGE_PRECISION) / payTokenAmountUsd
}

export const MAX_LEVERAGE = 1000

export default function usePayToken(
  tradeMode: TradeMode,
  tokenAddress: string | undefined,
  tokenPrice: bigint | undefined,
  tokenAmountUsd: bigint,
  setTokenAmountUsd: Dispatch<SetStateAction<bigint>>,
) {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)

  const [payTokenAddress, setPayTokenAddress] = useState<string>()
  const payTokenMinPriceData = useTokenPrices(data => data.get(payTokenAddress ?? '')?.min)

  const payTokenData = payTokenAddress ? tokensMetadata.get(payTokenAddress) : undefined
  const payTokenDecimals = payTokenData?.decimals ?? 0
  const latestPayTokenDecimals = useLatest(payTokenDecimals)
  const payTokenPrice = (() => {
    if (tradeMode === TradeMode.Limit && tokenAddress === payTokenAddress) return tokenPrice ?? 0n
    return payTokenMinPriceData ?? 0n
  })()
  const latestPayTokenPrice = useLatest(payTokenPrice)

  const latestPayTokenData = useLatest(payTokenData)

  const [payTokenAmount, baseSetPayTokenAmount] = useState(0n)

  const setPayTokenAmount = useCallback(
    (payTokenAmount: bigint) => {
      const newPayTokenAmountUsd = convertTokenAmountToUsd(
        payTokenAmount,
        latestPayTokenDecimals.current,
        latestPayTokenPrice.current,
      )

      let leverage = latestLeverage.current
      if (leverage === 0n) leverage = expandDecimals(latestLeverageInput.current, LEVERAGE_DECIMALS)

      setTokenAmountUsd((newPayTokenAmountUsd * leverage) / LEVERAGE_PRECISION)

      baseSetPayTokenAmount(payTokenAmount)
    },
    [setTokenAmountUsd],
  )

  const latestPayTokenAmount = useLatest(payTokenAmount)
  const payTokenAmountUsd = useMemo(
    () =>
      payTokenDecimals && payTokenPrice
        ? convertTokenAmountToUsd(payTokenAmount, payTokenDecimals, payTokenPrice)
        : 0n,
    [payTokenAmount, payTokenDecimals, payTokenPrice],
  )
  const latestPayTokenAmountUsd = useLatest(payTokenAmountUsd)

  // ------------------------------------------------------------------------------------------------------------------

  const [maxLeverage] = useState(() => BigInt(MAX_LEVERAGE) * LEVERAGE_PRECISION)
  const maxLeverageNumber = Number(shrinkDecimals(maxLeverage, LEVERAGE_DECIMALS))
  const latestMaxLeverage = useLatest(maxLeverage)

  const leverage = useMemo(
    () => calculateLeverage(tokenAmountUsd, payTokenAmountUsd),
    [tokenAmountUsd, payTokenAmountUsd],
  )

  const latestLeverage = useLatest(leverage)
  const [leverageInput, setLeverageInput] = useState('1')
  const [leverageInputIsFocused, setLeverageInputFocused] = useState(false)
  const latestLeverageInput = useLatest(leverageInput)

  const leverageNumber = Number(leverageInput)

  const handleLeverageChange = useCallback(
    (value: unknown) => {
      if (typeof value !== 'string' && typeof value !== 'number') return
      const leverage = expandDecimals(value, LEVERAGE_DECIMALS)

      if (leverage <= 0 || leverage > latestMaxLeverage.current) return

      const newTokenAmountUsd = (latestPayTokenAmountUsd.current * leverage) / LEVERAGE_PRECISION
      setTokenAmountUsd(newTokenAmountUsd)

      const newLeverageInput = formatNumber(
        shrinkDecimals(leverage, LEVERAGE_DECIMALS),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: 2,
        },
      )
      setLeverageInput(newLeverageInput)
    },
    [setTokenAmountUsd],
  )

  useEffect(
    function syncLeverageToLeverageInput() {
      if (leverageInputIsFocused) return
      const newLeverageInput = formatNumber(
        shrinkDecimals(leverage, LEVERAGE_DECIMALS),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: 2,
        },
      )

      if (newLeverageInput === '0') {
        setLeverageInput('1')
        return
      }

      setLeverageInput(newLeverageInput)
    },
    [leverage, leverageInputIsFocused],
  )

  return {
    payTokenAddress,
    setPayTokenAddress,
    payTokenAmount,
    setPayTokenAmount,
    payTokenAmountUsd,
    latestPayTokenAmount,
    latestPayTokenAmountUsd,
    payTokenData,
    latestPayTokenData,
    maxLeverage,
    maxLeverageNumber,
    leverage,
    leverageNumber,
    latestLeverage,
    leverageInput,
    latestLeverageInput,
    setLeverageInput,
    handleLeverageChange,
    setLeverageInputFocused,
  }
}
