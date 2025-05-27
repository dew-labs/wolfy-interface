import type {DependencyList, EffectCallback} from 'react'

export default function useAbortControllerEffect(
  effect: (abortController: AbortController) => ReturnType<EffectCallback>,
  deps?: DependencyList,
) {
  useEffect(() => {
    const abortController = new AbortController()

    const cleanup = effect(abortController)

    return () => {
      abortController.abort()
      cleanup?.()
    }
    // eslint-disable-next-line react-compiler/react-compiler -- it's intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps -- it's intentional
  }, deps)
}
