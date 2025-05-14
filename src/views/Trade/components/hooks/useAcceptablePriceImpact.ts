import {BASIS_POINTS_DECIMALS} from '@/lib/trade/numbers/constants'
import {cleanNumberString} from '@/utils/numberInputs'
import expandDecimals from '@/utils/numbers/expandDecimals'

const DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS = 3000n // 0.3%
const DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS_INPUT = '0.3'

export default function useAcceptablePriceImpact() {
  const [acceptablePriceImpactBps, setAcceptablePriceImpactBps] = useState(
    DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS,
  )
  const latestAcceptablePriceImpactBps = useLatest(acceptablePriceImpactBps)
  const [acceptablePriceImpactBpsInput, setAcceptablePriceImpactBpsInput] = useState(
    DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS_INPUT,
  )
  const latestAcceptablePriceImpactBpsInput = useLatest(acceptablePriceImpactBpsInput)

  const handleAcceptablePriceImpactBpsInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const valueInput = cleanNumberString(value)
      const valueBigint = expandDecimals(valueInput, BASIS_POINTS_DECIMALS)

      setAcceptablePriceImpactBpsInput(valueInput)
      setAcceptablePriceImpactBps(valueBigint)
    },
    [],
  )

  const handleAcceptablePriceImpactBpsInputBlur = useCallback(() => {
    if (latestAcceptablePriceImpactBpsInput.current) return
    setAcceptablePriceImpactBps(DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS)
    setAcceptablePriceImpactBpsInput(DEFAULT_ACCEPTABLE_PRICE_IMPACT_BPS_INPUT)
  }, [])

  return {
    acceptablePriceImpactBps,
    latestAcceptablePriceImpactBps,
    acceptablePriceImpactBpsInput,
    latestAcceptablePriceImpactBpsInput,
    setAcceptablePriceImpactBps,
    handleAcceptablePriceImpactBpsInputChange,
    handleAcceptablePriceImpactBpsInputBlur,
  }
}
