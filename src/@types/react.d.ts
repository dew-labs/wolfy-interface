import 'react'

import {type useSetAtom} from 'jotai'

declare module 'react' {
  /* eslint-disable @typescript-eslint/no-explicit-any -- its intentional */
  /*
   * Use this type to make sure that the callback passed will always be a memoized callback
   * For any function type, wrap it with MemoizedCallback<T>
   * Example: MemoizedCallback<(param: number) => boolean>
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- its intentional
  interface MemoizedCallback<T extends Function | ((...args: any[]) => any)> {
    (...args: Parameters<T>): ReturnType<T>
    __memoized__: true
  }

  /*
   * Use this type ONLY for functions with signature (arg: T) => void
   * Example: MemoizedCallbackOrDispatch<string> for (arg: string) => void
   */
  type MemoizedCallbackOrDispatch<T> =
    | MemoizedCallback<(arg: T) => void>
    | Dispatch<SetStateAction<T>>
    | ReturnType<typeof useSetAtom<T, unknown[], void>>

  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[],
  ): MemoizedCallback<T>
  /* eslint-enable @typescript-eslint/no-explicit-any -- its intentional */
}
