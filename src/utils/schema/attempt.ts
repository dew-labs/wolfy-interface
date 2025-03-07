import {type Type, type} from 'arktype'
import type {Out} from 'arktype/internal/attributes.ts'
import type {ChainedPipe} from 'arktype/internal/methods/base.ts'

import isFunction from '@/utils/types/guards/isFunction'

export type Traversal = Parameters<Parameters<ChainedPipe<unknown, unknown>>[0]>[1]

/**
 * Utility to add catch capability to an arktype, instead of return/throw when encountering an error, it can falls back to the another value.
 * Optionally, you can provide a function to transform the value or use the Traversal API to give custom error. Note that the `errors` property of this Traversal is always an empty array.
 *
 * @example
 * ```ts
 * const numberOrZero = attempt(type.number, 0)
 * const numberOrZero = attempt(type.number, (value, ctx) => parseInt(String(value)))
 * ```
 * @param of - the type to add the catch capability to
 * @param catchValueOrFn - the value to fallback to
 * @returns an arktype that takes everything and transforms it to/with the `catchValueOrFn`
 */
export default function attempt<T extends Type>(
  of: T,
  catchValueOrFn: T['infer'] | ((value: unknown, ctx: Traversal) => T['infer']),
) {
  return type.unknown.pipe.try((value, ctx) => {
    try {
      return of.assert(value)
    } catch (error) {
      if (error instanceof type.errors) {
        ctx.errors = error
      }

      if (isFunction(catchValueOrFn)) return catchValueOrFn(value, ctx)
      return catchValueOrFn
    }
  }) as Type<(In: T['inferIn']) => Out<T['infer']>>
}
