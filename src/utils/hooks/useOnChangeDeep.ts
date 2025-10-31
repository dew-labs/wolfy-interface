import isEqual from 'react-fast-compare'

/**
 * A hook that calls the onChange function when the value changes using deep equal.
 *
 * @param value - The value to check if it has changed.
 * @param onChangeFn - The function to call when the value changes.
 */
export default function useOnChangeDeep(value: unknown[], onChangeFn: () => void) {
  const [prevValue, setPrevValue] = useState(value)
  if (!isEqual(prevValue, value)) {
    onChangeFn()
    setPrevValue(value)
  }
}
