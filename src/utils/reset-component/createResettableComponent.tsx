import {memo, type MemoizedCallback, type NamedExoticComponent, type PropsWithRef} from 'react'

import {useResetComponent} from './useResetComponent'

export default function createResetableComponent<
  T extends {
    reset: MemoizedCallback<() => void>
  },
>(Component: React.ComponentType<T>): NamedExoticComponent<PropsWithRef<Omit<T, 'reset'>>> {
  const ResettableComponent = function (props: Omit<T, 'reset'>) {
    const [resetKey, reset] = useResetComponent()

    return <Component {...(props as T)} key={resetKey} reset={reset} />
  }

  // Object.defineProperty(ResettableComponent, 'name', {
  //   value: Component.name,
  //   writable: false,
  // })

  return memo(ResettableComponent)
}
