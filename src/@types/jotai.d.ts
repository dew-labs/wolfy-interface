import 'jotai'

import type {
  ExtractAtomArgs,
  ExtractAtomResult,
  ExtractAtomValue,
  PrimitiveAtom,
  useAtomValue,
  WritableAtom,
} from 'jotai'
import type {MemoizedCallback, SetStateAction} from 'react'

declare module 'jotai' {
  type Options = Parameters<typeof useAtomValue>[1]
  type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result

  export declare function useAtom<Value, Args extends unknown[], Result>(
    atom: WritableAtom<Value, Args, Result>,
    options?: Options,
  ): [Awaited<Value>, MemoizedCallback<SetAtom<Args, Result>>]
  export declare function useAtom<Value>(
    atom: PrimitiveAtom<Value>,
    options?: Options,
  ): [Awaited<Value>, MemoizedCallback<SetAtom<[SetStateAction<Value>], void>>]
  export declare function useAtom<AtomType extends WritableAtom<unknown, never[], unknown>>(
    atom: AtomType,
    options?: Options,
  ): [
    Awaited<ExtractAtomValue<AtomType>>,
    MemoizedCallback<SetAtom<ExtractAtomArgs<AtomType>, ExtractAtomResult<AtomType>>>,
  ]

  export declare function useSetAtom<Value, Args extends unknown[], Result>(
    atom: WritableAtom<Value, Args, Result>,
    options?: Options,
  ): MemoizedCallback<SetAtom<Args, Result>>
  export declare function useSetAtom<AtomType extends WritableAtom<unknown, never[], unknown>>(
    atom: AtomType,
    options?: Options,
  ): MemoizedCallback<SetAtom<ExtractAtomArgs<AtomType>, ExtractAtomResult<AtomType>>>
}
