import type {NoInfer, PickOptional, SearchMiddleware} from '@tanstack/router-core'
import {dequal} from 'dequal'
import {omitBy} from 'remeda'

// NOTE: follow the type implementation of https://github.com/TanStack/router/blob/9b460c4ed076c04b6160a915719fb136fc385c6f/packages/router-core/src/searchMiddleware.ts
export default function stripDefaultSearchParams<
  TSearchSchema,
  TOptionalProps = PickOptional<NoInfer<TSearchSchema>>,
>(input: Partial<NoInfer<TOptionalProps>>): SearchMiddleware<TSearchSchema> {
  return ({search, next}) => {
    const result = next(search)

    const newResult = omitBy((value, key) => dequal(result[key], input[key]))(result as object)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any -- its desired
    return newResult as any
  }
}
