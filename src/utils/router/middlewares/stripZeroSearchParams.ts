import type {SearchMiddleware} from '@tanstack/router-core'
import {klona} from 'klona'

// NOTE: follow the type implementation of https://github.com/TanStack/router/blob/9b460c4ed076c04b6160a915719fb136fc385c6f/packages/router-core/src/searchMiddleware.ts
export default function stripZeroSearchParams<TSearchSchema>(): SearchMiddleware<TSearchSchema> {
  return ({search, next}) => {
    const result = next(search)

    const newResult = klona(result)

    // Deep search the object: find '' (empty string) property and remove it
    const removeZeros = (obj: unknown) => {
      if (typeof obj !== 'object' || obj === null) return

      for (const key in obj) {
        // @ts-expect-error - we know that we can access the key
        if (obj[key] === 0) {
          // @ts-expect-error - we know that we can access the key
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- its desired
          delete obj[key]
          // @ts-expect-error - we know that we can access the key
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // @ts-expect-error - we know that we can access the key
          removeZeros(obj[key])
        }
      }
    }

    removeZeros(newResult)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any -- its desired
    return newResult as any
  }
}
