import type {DependencyList, EffectCallback} from 'react'

/**
 * An effect that will automatically abort when the component is unmounted.
 *
 * @param effect - The effect to run.
 * @param [deps] - The dependencies to watch.
 */
export default function useAbortableEffect(
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
  }, deps)
}
