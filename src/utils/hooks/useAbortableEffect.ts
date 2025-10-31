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
    // eslint-disable-next-line react-compiler/react-compiler -- it's intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps -- it's intentional
  }, deps)
}
