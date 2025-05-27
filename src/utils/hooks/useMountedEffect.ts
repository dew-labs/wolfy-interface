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

    // eslint-disable-next-line react-compiler/react-compiler -- it's intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps -- it's intentional
  }, deps)
}
