import 'react'

declare module 'react' {
  /* eslint-disable @typescript-eslint/no-explicit-any -- its intentional */
  /*
   * Use this type to make sure that the callback passed will always be a memoized callback
   */
  interface MemoizedCallback<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T>
    memoized: true
  }
  type MemoizedCallbackOrDispatch<T> =
    | MemoizedCallback<(arg: T) => void>
    | Dispatch<SetStateAction<T>>

  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[],
  ): MemoizedCallback<T>
  /* eslint-enable @typescript-eslint/no-explicit-any -- its intentional */
}
