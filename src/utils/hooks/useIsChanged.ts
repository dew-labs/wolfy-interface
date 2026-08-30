import type {DependencyList} from 'react'

export default function useIsChanged(...deps: DependencyList) {
  const newValue = {} // New object created everytime
  const value = useMemo(() => newValue, deps)

  return value === newValue // If these are the same object, it means the deps changed
}
