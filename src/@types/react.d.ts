import 'react'

import type {IsTuple} from 'type-fest'

import type {IsExact} from '@/utils/types/IsExact'
import type {NonPrimitiveAndFunctionAndChildrenKeys} from '@/utils/types/NonPrimitiveAndFunctionAndChildrenKeys'

declare const isMemoized: unique symbol
declare const isStable: unique symbol
declare const isDeepMemo: unique symbol

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type -- its intentional */
declare module 'react' {
  interface MemoizedBrand {
    [isMemoized]: true
  }

  interface StableBrand extends MemoizedBrand {
    [isStable]: true
  }
  type MemoizedValue<T extends object> = T & {
    [K in keyof T]: Memoized<T[K]>
  } & MemoizedBrand

  // interface MemoizedValue<T extends object> extends T {
  //   [isMemoized]: true
  // }
  //

  type MemoizedArray<T> = Memoized<T>[] & MemoizedBrand

  type MemoizedTuple<T extends readonly unknown[]> =
    IsTuple<
      T,
      {
        fixedLengthOnly: false
      }
    > extends true
      ? {
          [K in keyof T]: T[K] extends infer U ? Memoized<U> : never
        } & MemoizedBrand
      : never

  type MemoizedCallback<T extends Function | ((...args: any[]) => any)> = T & MemoizedBrand

  // interface MemoizedCallback<T extends Function | ((...args: any[]) => any)> {
  //   (...args: Parameters<T>): ReturnType<T>
  //   [isMemoized]: true
  // }

  type StableValue<T extends object> = T & {
    [K in keyof T]: Stable<T[K]>
  } & StableBrand

  // interface StableValue<T extends object> extends MemoizedValue<T> {
  //   [isStable]: true
  // }

  type StableArray<T> = Stable<T>[] & StableBrand

  type StableTuple<T extends readonly unknown[]> =
    IsTuple<
      T,
      {
        fixedLengthOnly: false
      }
    > extends true
      ? {
          [K in keyof T]: T[K] extends infer U ? Stable<U> : never
        } & StableBrand
      : never

  type StableCallback<T extends Function | ((...args: any[]) => any)> = T & StableBrand

  // interface StableCallback<T extends Function | ((...args: any[]) => any)>
  //   extends MemoizedCallback<T> {
  //   [isStable]: true
  // }

  interface RefObject<T> extends StableBrand {
    current: T
  }

  type Memoized<T> = T extends string & {}
    ? T
    : T extends ElementType
      ? T
      : IsExact<RefObject<any>, T> extends true
        ? T
        : T extends Function | ((...args: any[]) => any)
          ? MemoizedCallback<T>
          : IsTuple<
                T,
                {
                  fixedLengthOnly: false
                }
              > extends true
            ? MemoizedTuple<T>
            : T extends (infer K)[]
              ? MemoizedArray<K>
              : T extends object
                ? MemoizedValue<T>
                : T

  type Stable<T> =
    Memoized<T> extends MemoizedTuple<T>
      ? StableTuple<T>
      : Memoized<T> extends MemoizedArray<T>
        ? StableArray<T>
        : Memoized<T> extends MemoizedCallback<T>
          ? StableCallback<T>
          : Memoized<T> extends MemoizedValue<T>
            ? StableValue<T>
            : Memoized<T>

  type StableDispatchSetStateAction<T> = StableCallback<Dispatch<SetStateAction<T>>>

  type UnwrapMemoized<T> =
    T extends MemoizedCallback<infer F> ? F : T extends MemoizedValue<infer F> ? F : T

  type UnwrapStable<T> =
    T extends StableCallback<infer F> ? F : T extends StableValue<infer F> ? F : T

  function useLatest<T>(value: T): RefObject<T>

  function useMemo<T>(factory: () => T, deps: []): Stable<T>
  function useMemo<T>(factory: () => T, deps: DependencyList): Memoized<T>

  function useCallback<T extends Function | ((...args: any[]) => any)>(
    callback: T,
    deps: [],
  ): StableCallback<T>
  function useCallback<T extends Function | ((...args: any[]) => any)>(
    callback: T,
    deps: DependencyList,
  ): MemoizedCallback<T>

  function useState<S>(
    initialState: S | (() => S),
  ): [Memoized<S>, StableCallback<Dispatch<SetStateAction<S>>>]
  function useState<S = undefined>(): [
    Memoized<S | undefined>,
    StableCallback<Dispatch<SetStateAction<S | undefined>>>,
  ]

  function memo<P extends object>(
    Component: ComponentType<Memoized<P>>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
  ): MemoExoticComponent<ComponentType<P>> // MemoExoticComponent<ComponentType<Memoized<P>>>
  function memo<P extends object>(
    Component: FunctionComponent<Memoized<P>>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
  ): NamedExoticComponent<P> // NamedExoticComponent<Memoized<P>>

  type ChildrenKey<T> = 'children' extends keyof T ? 'children' : never

  type DeepMemoProps<
    T extends object,
    DP extends NonPrimitiveAndFunctionAndChildrenKeys<T>,
  > = T extends any ? Pick<T, DP | ChildrenKey<T>> & Memoized<Omit<T, DP | ChildrenKey<T>>> : never

  interface DeepMemoExoticComponent<
    T extends ComponentType<any>,
    DP extends NonPrimitiveAndFunctionAndChildrenKeys<ComponentProps<T>>,
  > extends MemoExoticComponent<ComponentProps<T>> {
    // MemoExoticComponent<DeepMemoProps<ComponentProps<T>, DP>>
    [isDeepMemo]: DP | ChildrenKey<ComponentProps<T>>
  }

  interface DeepNamedExoticComponent<
    T extends object,
    DP extends NonPrimitiveAndFunctionAndChildrenKeys<T>,
  > extends NamedExoticComponent<T> {
    // NamedExoticComponent<DeepMemoProps<T, DP>>
    [isDeepMemo]: DP | ChildrenKey<T>
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type -- its intentional */
