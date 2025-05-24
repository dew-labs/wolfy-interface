import type {MemoExoticComponent} from 'react'
import isEqual from 'react-fast-compare'
import {omit, pick} from 'remeda'

import shallowEqual from './shallowEqual'

/**
 * @param Component - The component to selectively deep memoize.
 * @param propsToDeepEqual - The props to deep equal, default to `['children']`.
 * - `string[]` - Deep equal the props in the array, these usually be the props that are ReactNode.
 * - `'all'` - Deep equal all props.
 * @returns The memoized component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- match original react type
export default function deepMemo<T extends ComponentType<any>>(
  Component: T,
  propsToDeepEqual: (keyof ComponentProps<T>)[] | 'all' = ['children'],
): MemoExoticComponent<T> {
  return memo(Component, (prevProps, nextProps) => {
    if (propsToDeepEqual === 'all') {
      return isEqual(prevProps, nextProps)
    }

    return (
      shallowEqual(omit(prevProps, propsToDeepEqual), omit(nextProps, propsToDeepEqual)) &&
      isEqual(pick(prevProps, propsToDeepEqual), pick(nextProps, propsToDeepEqual))
    )
  })
}
