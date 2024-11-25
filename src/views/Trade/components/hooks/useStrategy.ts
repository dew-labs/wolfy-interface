import {useState} from 'react'
import {useLatest} from 'react-use'

export type Strategy = 'leverageByCollateral' | 'leverageBySize' | 'independent'

export default function useStrategy() {
  const [isLeverageLocked, setIsLeverageLocked] = useState(false)
  const latestIsLeverageLocked = useLatest(isLeverageLocked)
  const [focusedInput, setFocusedInput] = useState<'from' | 'to'>('from')
  const latestFocusedInput = useLatest(focusedInput)
  const strategy: Strategy = isLeverageLocked
    ? focusedInput === 'from'
      ? 'leverageByCollateral'
      : 'leverageBySize'
    : 'independent'

  return {
    isLeverageLocked,
    latestIsLeverageLocked,
    setIsLeverageLocked,
    strategy,
    focusedInput,
    latestFocusedInput,
    setFocusedInput,
  }
}
