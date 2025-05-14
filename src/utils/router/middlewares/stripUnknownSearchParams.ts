import type {SearchMiddleware} from '@tanstack/router-core'
import {type Type} from 'arktype'
import {omitBy} from 'remeda'

// export type KnownKeys<T extends Type<object>> = UnionToTuple<T['props'][number]['key']>

// NOTE: follow the type implementation of https://github.com/TanStack/router/blob/9b460c4ed076c04b6160a915719fb136fc385c6f/packages/router-core/src/searchMiddleware.ts
// TODO: support standard schema instead of just arktype
export default function stripUnknownSearchParams<TSearchSchema>(
  input: Type<Record<string, unknown>>,
): SearchMiddleware<TSearchSchema> {
  return ({search, next}) => {
    const result = next(search)

    const knownKeys = input.props.map(prop => prop.key)

    const knownKeysSet = new Set(knownKeys)

    const newResult = omitBy((value, key) => !knownKeysSet.has(key))(result as object)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any -- its desired
    return newResult as any
  }
}
