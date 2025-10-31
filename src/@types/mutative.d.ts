import {type Draft, type Immutable, type Options, type Patches, type PatchesOptions} from 'mutative'
import {type Dispatch} from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-invalid-void-type -- its intentional */
declare module 'use-mutative' {
  type DraftFunction<S> = (draft: Draft<S>) => void
  type Updater<S> = Stable<(value: S | (() => S) | DraftFunction<S>) => void>
  type InitialValue<I> = I extends (...args: any) => infer R ? R : I
  type Result<S, O extends PatchesOptions, F extends boolean> = O extends true | object
    ? [Memoized<F extends true ? Immutable<S> : S>, Updater<S>, Patches<O>, Patches<O>]
    : F extends true
      ? [Memoized<Immutable<S>>, Updater<S>]
      : [Memoized<S>, Updater<S>]
  declare function useMutative<S, F extends boolean = false, O extends PatchesOptions = false>(
    /**
     * The initial state. You may optionally provide an initializer function to calculate the initial state.
     */
    initialValue: S,
    /**
     * Options for the `useMutative` hook.
     */
    options?: Options<O, F>,
  ): Result<InitialValue<S>, O, F>
  type ReducerResult<S, A, O extends PatchesOptions, F extends boolean> = O extends true | object
    ? [Memoized<F extends true ? Immutable<S> : S>, Stable<Dispatch<A>>, Patches<O>, Patches<O>]
    : F extends true
      ? [Memoized<Immutable<S>>, Stable<Dispatch<A>>]
      : [Memoized<S>, Stable<Dispatch<A>>]
  type Reducer<S, A> = (draftState: Draft<S>, action: A) => void | S | undefined
  declare function useMutativeReducer<
    S,
    A,
    I,
    F extends boolean = false,
    O extends PatchesOptions = false,
  >(
    reducer: Reducer<S, A>,
    initializerArg: S & I,
    initializer: (arg: S & I) => S,
    options?: Options<O, F>,
  ): ReducerResult<S, A, O, F>
  declare function useMutativeReducer<
    S,
    A,
    I,
    F extends boolean = false,
    O extends PatchesOptions = false,
  >(
    reducer: Reducer<S, A>,
    initializerArg: I,
    initializer: (arg: I) => S,
    options?: Options<O, F>,
  ): ReducerResult<S, A, O, F>
  declare function useMutativeReducer<
    S,
    A,
    F extends boolean = false,
    O extends PatchesOptions = false,
  >(
    reducer: Reducer<S, A>,
    initialState: S,
    initializer?: undefined,
    options?: Options<O, F>,
  ): ReducerResult<S, A, O, F>
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-invalid-void-type -- its intentional */
