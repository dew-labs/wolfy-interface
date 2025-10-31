import shallowEqual from '@/utils/react/shallowEqual'

/**
 * A hook that calls the onChange function when the value changes using shallow equal.
 *
 * @param value - The value to check if it has changed.
 * @param onChangeFn - The function to call when the value changes.
 */
export default function useOnChange(value: unknown[], onChangeFn: () => void) {
  const [prevValue, setPrevValue] = useState(value)
  if (!shallowEqual(prevValue, value)) {
    onChangeFn()
    setPrevValue(value)
  }
}
