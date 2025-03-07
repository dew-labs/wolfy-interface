import {type Type} from 'arktype'

import attempt from './attempt'

/**
 * Utility to add fallback capability to an arktype, instead of return/throw when encountering an error, it falls back to the specific value. This ensures no error occurs.
 * If you want access to the context (Traversal API), please use {@link attempt} instead.
 *
 * @example
 * ```ts
 * const numberOrZero = fallback(type('string'), 0)
 * ```
 * @param of - the type to add the fallback capability to
 * @param to - the value to fallback to
 * @returns an arktype that takes everything and transforms it to/with the `fallbackValueOrFn`
 */
export default function fallback<T extends Type>(
  of: T,
  to: T['infer'] | ((value: unknown) => T['infer']),
) {
  return attempt(of, to)
}

/**
 * (Use only for properties)
 * Utility to add fallback to default value to an arktype, instead of return/throw when encountering an error, it falls back to the default value. This ensures no error occurs.
 * In addition to {@link fallback}, this function also ensures the default value is returned if the property is not present, or equals `undefined`.
 *
 * @example
 * ```ts
 * const searchParams = type({
 *  token: fallbackToDefault(type('string'), ''),
 * })
 * ```
 * @param of - the type to add the fallback capability to
 * @param defaultValue - the value to fallback/default to
 * @returns an arktype that takes everything and returns the `defaultValue` if there is an error
 */
export function fallbackToDefault<T extends Type>(of: T, defaultValue: T['infer']) {
  // @ts-expect-error -- cannot replicate type due to internal type of arktype
  return attempt(of, defaultValue).default(() => defaultValue)
}
