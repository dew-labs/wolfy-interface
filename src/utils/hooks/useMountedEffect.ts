import type {DependencyList, EffectCallback} from 'react'

export default function useMountedEffect(
  effect: (isMounted: {current: boolean}) => ReturnType<EffectCallback>,
  deps?: DependencyList,
) {
  useEffect(() => {
    const isMounted = {current: true}

    const cleanup = effect(isMounted)

    return () => {
      isMounted.current = false
      cleanup?.()
    }
  }, deps)
}
