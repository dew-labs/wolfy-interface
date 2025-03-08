import {type ArkErrors, type Traversal, type Type, type} from 'arktype'
import type {Out} from 'arktype/internal/attributes.ts'
// import type {ChainedPipe} from 'arktype/internal/methods/base.ts'

/**
 * An arktype utility type to create an array that filtered out invalid values and retain valid values instead of throw/return an error. This ensure no error occur.
 * Limitation: cannot use `.moreThanLength`, `.atLeastLength`, `.lessThanLength`, `.atMostLength` on the array
 *
 * @example
 * ```ts
 * const itemType = type('number').pipe.try(item => String(item))
 * const itemsType = filteredArray(itemType)
 *
 * type itemsInferIn = typeof itemsType.inferIn
 * //   ^? type itemsInferIn = number[]
 * type itemsInferOut = typeof itemsType.inferOut
 * //   ^? type itemsInferOut = string[]
 *
 * itemsType(['foo', 1, 'bar', 2]) // = ['1', '2']
 * ```
 *
 * @param t - the item type of the array
 * @param errorHandler - the error handler
 * @returns the array of items
 */
export default function filteredArray<T extends Type>(
  t: T,
  errorHandler?: (e: ArkErrors, ctx: Traversal) => void,
): Type<(In: T['inferIn'][]) => Out<T['infer'][]>> {
  return type.unknown.array().pipe.try((items, ctx) => {
    const newItems: T['infer'][] = []

    for (const item of items) {
      try {
        t.assert(item)
        newItems.push(t(item))
      } catch (e) {
        if (errorHandler) errorHandler(e as ArkErrors, ctx)
        else console.error(e)
      }
    }

    return newItems
  })
}
