import type {
  DeepMemoExoticComponent,
  DeepMemoProps,
  DeepNamedExoticComponent,
  FunctionComponent,
} from 'react'
import isEqual from 'react-fast-compare'
import {omit, pick} from 'remeda'

import type {NonPrimitiveAndFunctionAndChildrenKeys} from '@/utils/types/NonPrimitiveAndFunctionAndChildrenKeys'

import shallowEqual from './shallowEqual'
/* eslint-disable @typescript-eslint/no-explicit-any -- intentional */

// NOTE: we have to use currying because typescript doesn't support Partial Type Argument Inference yet https://github.com/microsoft/TypeScript/issues/26242
// So if we use deepMemo<P> and leave out the propsToDeepEqual, typescript will not infer it, but throw an error to your face.
/**
 * This function behave like `React.memo`, but with deep equal for props instead of shallow equal.
 * Originally this utility is used to avoid re-rendering of components that accepts `children` props, because when JSX passed, it always create new reference each time.
 *
 * The returned function accepts `propsToDeepEqual` parameter which specifies the props to deep equal (in addition to `children`):
 * - `string[]` - Deep equal the props in the array, these usually be the props that are ReactNode (react element), or not primitive: object, array, Map, Set.
 * - `'all'` - Deep equal all props.
 *
 * Note that we cannot deepEqual functions, functions are always shallow equal.
 * Also, `children` will always deep equal.
 *
 * @returns A function that accepts the component and returns the memoized component.
 */
export default function deepMemo<P extends object>(): <
  const TKeys extends
    | readonly NonPrimitiveAndFunctionAndChildrenKeys<P>[]
    | 'all'
    | undefined = undefined,
>(
  propsToDeepEqual?: TKeys,
) => (
  Component: FunctionComponent<
    DeepMemoProps<
      P,
      TKeys extends readonly (infer K extends NonPrimitiveAndFunctionAndChildrenKeys<P>)[]
        ? K
        : TKeys extends 'all'
          ? NonPrimitiveAndFunctionAndChildrenKeys<P>
          : never
    >
  >,
) => TKeys extends readonly (infer K extends NonPrimitiveAndFunctionAndChildrenKeys<P>)[]
  ? DeepNamedExoticComponent<P, K>
  : TKeys extends 'all'
    ? DeepNamedExoticComponent<P, NonPrimitiveAndFunctionAndChildrenKeys<P>>
    : DeepNamedExoticComponent<P, never>
export default function deepMemo<T extends ComponentType<any>>(): <
  const TKeys extends
    | readonly NonPrimitiveAndFunctionAndChildrenKeys<ComponentProps<T>>[]
    | 'all'
    | undefined = undefined,
>(
  propsToDeepEqual?: TKeys,
) => (
  Component: T,
) => TKeys extends readonly (infer K extends NonPrimitiveAndFunctionAndChildrenKeys<
  ComponentProps<T>
>)[]
  ? DeepMemoExoticComponent<T, K>
  : TKeys extends 'all'
    ? DeepMemoExoticComponent<T, NonPrimitiveAndFunctionAndChildrenKeys<ComponentProps<T>>>
    : DeepMemoExoticComponent<T, never>
export default function deepMemo<P extends object>(): any {
  return (propsToDeepEqual?: readonly (keyof P)[] | 'all'): any => {
    return (Component: FunctionComponent<P> | ComponentType<P>): any => {
      return memo(Component, (prevProps, nextProps) => {
        if (propsToDeepEqual === 'all') {
          return isEqual(prevProps, nextProps)
        }

        const deepCompareKeys = (
          propsToDeepEqual ? [...propsToDeepEqual, 'children'] : ['children']
        ) as (keyof P)[]

        return (
          shallowEqual(omit(prevProps, deepCompareKeys), omit(nextProps, deepCompareKeys)) &&
          isEqual(pick(prevProps, deepCompareKeys), pick(nextProps, deepCompareKeys))
        )
      })
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any -- intentional */
