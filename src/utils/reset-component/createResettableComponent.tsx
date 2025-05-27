/* eslint-disable @eslint-react/naming-convention/filename -- this is a utility file */
import type {NamedExoticComponent} from 'react'

import {useResetComponent} from './useResetComponent'

export default function createResetableComponent<T extends {reset: MemoizedCallback<() => void>}>(
  Component: ComponentType<T>,
): NamedExoticComponent<Omit<T, 'reset'>> {
  const ResettableComponent = function (props: Omit<T, 'reset'>) {
    const [resetKey, reset] = useResetComponent()

    return <Component {...(props as T)} key={resetKey} reset={reset} />
  }

  Object.defineProperty(ResettableComponent, 'name', {value: Component.name, writable: false})

  Object.defineProperty(ResettableComponent, 'displayName', {
    value: Component.displayName,
    writable: false,
  })

  return memo(ResettableComponent)
}
/* eslint-enable @eslint-react/naming-convention/filename */
