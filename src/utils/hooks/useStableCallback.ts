/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-invalid-void-type -- it's intentional */

/**
 * A hook that returns a callback with guaranteed referential stability.
 *
 * Downside is that even if you wrap a callback that can be undefined or null, the returned callback will be guaranteed to be not undefined or null. So be careful when pass the returned callback to other place.
 * If your you only call the callback like `callback?.()` it will be safe.
 *
 * NOTE: the different from `https://github.com/satya164/use-latest-callback` is that our `useLatest` operate on render instead of inside `useLayoutEffect`, and we accept `undefined | null`
 *
 * @param callback - the callback make stable
 * @returns your desired callback
 */
export default function useStableCallback<
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- it's intentional
  T extends Function | ((...args: any[]) => any) | null | undefined,
>(callback: T) {
  const latestCallback = useLatest(callback)
  return useCallback((...args) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- it's intentional
    return latestCallback.current?.(...args)
  }, []) as unknown as StableCallback<UnwrapMemoized<Exclude<T, null | undefined>>>
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-invalid-void-type -- it's intentional */
