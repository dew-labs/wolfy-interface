import {type MemoizedCallbackOrDispatch, useCallback, useState} from 'react'
import {useLatest} from 'react-use'

import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import {cleanNumberString} from '@/utils/numberInputs'
import abs from '@/utils/numbers/bigint/abs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

const ACCEPTABLE_DIFF = 1n
const USD_DECIMALS_ROUND_TO = 2
const ACCEPTABLE_DIFF_USD = expandDecimals(1n, USD_DECIMALS - USD_DECIMALS_ROUND_TO)

export enum InputMode {
  Usd = 'Usd', // In USD mode, the input is the USD amount and the token amount is calculated from the USD amount
  Token = 'Token', // In TOKEN mode, the input is the token amount and the USD amount is calculated from the token amount
}

interface Options {
  sync?: boolean // If true, the amount will be update with the value of the input
  mode?: InputMode
  lockMode?: boolean
}

const DEFAULT_OPTIONS = {
  sync: true,
  mode: InputMode.Token,
  lockMode: false,
} satisfies Options

export default function useTokenInput(
  decimals: bigint | number,
  amount: bigint | undefined,
  setAmount: MemoizedCallbackOrDispatch<(amount: bigint) => void>,
  price: Price,
  options: Options = DEFAULT_OPTIONS,
) {
  const latestDecimals = useLatest(decimals)

  const resolvedOptions: Required<Options> = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  const [mode, setMode] = useState<InputMode>(resolvedOptions.mode)
  const latestMode = useLatest(mode)
  const priceToUse = price.max
  const latestPriceToUse = useLatest(priceToUse)

  const [input, setInput] = useState(() => shrinkDecimals(amount, decimals))
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [usdInput, setUsdInput] = useState('')
  const [isUsdInputFocused, setIsUsdInputFocused] = useState(false)
  const isFocused = isInputFocused || isUsdInputFocused

  // Priority: amount > input = usdInput
  // If current mode is token, sync input with amount
  // If current mode is usd, sync input with usdInput
  ;(function syncAmountToInput() {
    try {
      const currentAmount = expandDecimals(input, decimals)
      const diff = abs(currentAmount - (amount ?? 0n))

      if (diff <= ACCEPTABLE_DIFF) return

      if (mode === InputMode.Token && resolvedOptions.sync) {
        setAmount(currentAmount)
        return
      }

      if (isInputFocused) return

      const newInput = shrinkDecimals(amount, decimals)
      setInput(newInput)
    } catch {
      // empty
    }
  })()
  ;(function syncAmountAndUsdInputTogether() {
    try {
      const currentUsd = expandDecimals(usdInput, USD_DECIMALS)
      const newUsd = amount ? (amount * priceToUse) / expandDecimals(1n, decimals) : 0n
      const diff = abs(currentUsd - newUsd)

      if (diff <= ACCEPTABLE_DIFF_USD) return

      // If we are in USD mode, we need to keep the USD unchanged and update the amount
      if (mode === InputMode.Usd && resolvedOptions.sync) {
        const newAmount = (currentUsd * expandDecimals(1n, decimals)) / priceToUse
        setAmount(newAmount)
        return
      }

      // If we are in token mode, we need to keep the amount unchanged and update the USD input
      if (isUsdInputFocused) return

      const newUsdInput = shrinkDecimals(newUsd, USD_DECIMALS, USD_DECIMALS_ROUND_TO)
      setUsdInput(newUsdInput)
    } catch {
      // empty
    }
  })()

  // -------------------------------------------------------------------------------------------------------------------

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (latestMode.current !== InputMode.Token) return

      try {
        const value = e.target.value
        const valueInput = cleanNumberString(value)
        const valueBigInt = expandDecimals(valueInput, latestDecimals.current)

        setInput(valueInput)
        setAmount(valueBigInt)
      } catch {
        console.error('Invalid token amount input')
      }
    },
    [setAmount],
  )

  const handleInputFocusChange = useCallback((isFocused: boolean) => {
    setIsInputFocused(isFocused)
    if (isFocused) setIsUsdInputFocused(false)
  }, [])

  const handleUsdInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (latestMode.current !== InputMode.Usd) return

      try {
        const value = e.target.value
        const valueInput = cleanNumberString(value)
        const valueBigInt = expandDecimals(valueInput, USD_DECIMALS)
        const amount =
          expandDecimals(valueBigInt, latestDecimals.current) / latestPriceToUse.current

        setUsdInput(valueInput)
        setAmount(amount)
      } catch {
        console.error('Invalid token amount input')
      }
    },
    [setAmount],
  )

  const handleUsdInputFocusChange = useCallback((isFocused: boolean) => {
    setIsUsdInputFocused(isFocused)
    if (isFocused) setIsInputFocused(false)
  }, [])

  return {
    mode,
    input,
    usdInput,
    isFocused,
    isInputFocused,
    isUsdInputFocused,
    handleInputFocusChange,
    handleInputChange,
    handleUsdInputChange,
    handleUsdInputFocusChange,
    setMode,
    setInput,
    setIsInputFocused,
    setUsdInput,
    setIsUsdInputFocused,
  }
}
