import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import {logError} from '@/utils/logger'
import {cleanNumberString} from '@/utils/numberInputs'
import abs from '@/utils/numbers/bigint/abs'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'

const ACCEPTABLE_DIFF = 1n
const USD_DECIMALS_ROUND_TO = 2
const ACCEPTABLE_DIFF_USD = expandDecimals(1n, USD_DECIMALS - USD_DECIMALS_ROUND_TO)

export const InputMode = {
  Usd: 'usd', // In USD mode, the input is the USD amount and the token amount is calculated from the USD amount
  Token: 'token', // In TOKEN mode, the input is the token amount and the USD amount is calculated from the token amount
} as const
export type InputMode = (typeof InputMode)[keyof typeof InputMode]

/*
  There will be 2 modes: Usd and Token mode
  - In Usd mode, the input is the USD amount and the token amount is calculated from the USD amount, the price and the decimals
  - In Token mode, the input is the token amount and the USD amount is calculated from the token amount, the price and the decimals

  When `amount` is set, the input will be updated with the value of the amount
  When `input` is set, the amount will be updated with the value of the input
*/
export default function useTokenInput(
  decimals: bigint | number,
  amount: bigint | undefined,
  setAmount: MemoizedCallbackOrDispatch<bigint>,
  price: Price,
  defaultMode?: InputMode,
) {
  const latestDecimals = useLatest(decimals)
  const latestSetAmount = useLatest(setAmount)

  const [mode, baseSetMode] = useState<InputMode>(defaultMode ?? InputMode.Token)
  const latestMode = useLatest(mode)
  const priceToUse = price.max
  const latestPriceToUse = useLatest(priceToUse)

  const [input, baseSetInput] = useState(() => shrinkDecimals(amount, decimals))
  const [isFocused, setIsFocused] = useState(false)
  const latestIsFocused = useLatest(isFocused)
  const latestInput = useLatest(input)

  const setMode = useCallback((mode: InputMode | ((prevMode: InputMode) => InputMode)) => {
    const nextMode = typeof mode === 'function' ? mode(latestMode.current) : mode

    baseSetMode(nextMode)

    if (nextMode === InputMode.Token) {
      // convert current input (in USD) to token amount
      const usd = expandDecimals(latestInput.current, USD_DECIMALS)
      const tokenAmount = convertUsdToTokenAmount(
        usd,
        latestDecimals.current,
        latestPriceToUse.current,
      )
      baseSetInput(shrinkDecimals(tokenAmount, latestDecimals.current))
    } else {
      // convert current input (in token) to USD amount
      const tokenAmount = expandDecimals(latestInput.current, latestDecimals.current)
      const usd = convertTokenAmountToUsd(
        tokenAmount,
        latestDecimals.current,
        latestPriceToUse.current,
      )
      baseSetInput(shrinkDecimals(usd, USD_DECIMALS))
    }
  }, [])

  const setInput = useCallback((value: string) => {
    try {
      const valueInput = cleanNumberString(value)
      baseSetInput(valueInput)

      if (latestMode.current === InputMode.Token) {
        const valueBigInt = expandDecimals(valueInput, latestDecimals.current)
        latestSetAmount.current(valueBigInt)
      } else {
        const valueBigInt = expandDecimals(valueInput, USD_DECIMALS)
        const amount =
          expandDecimals(valueBigInt, latestDecimals.current) / latestPriceToUse.current
        latestSetAmount.current(amount)
      }
    } catch (error) {
      logError(error, {value}, {mode: latestMode.current})
    }
  }, [])

  // -------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (latestIsFocused.current) return
    if (latestMode.current === InputMode.Token) {
      const currentAmount = expandDecimals(latestInput.current, latestDecimals.current)
      const diff = abs(currentAmount - (amount ?? 0n))
      if (diff <= ACCEPTABLE_DIFF) return
      baseSetInput(shrinkDecimals(amount, decimals))
    } else {
      const currentUsd = expandDecimals(latestInput.current, USD_DECIMALS)
      const newUsd = convertTokenAmountToUsd(amount, decimals, latestPriceToUse.current)
      const diff = abs(currentUsd - newUsd)
      if (diff <= ACCEPTABLE_DIFF_USD) return
      baseSetInput(shrinkDecimals(newUsd, USD_DECIMALS, USD_DECIMALS_ROUND_TO))
    }
  }, [amount, decimals])

  return {mode, input, setMode, setInput, isFocused, setIsFocused}
}
