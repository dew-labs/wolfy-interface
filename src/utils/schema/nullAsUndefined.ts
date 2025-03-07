import {type} from 'arktype'

/**
 * An arktype utility to convert null to undefined.
 *
 * @example
 * ```ts
 * const typeA = type.number
 * const typeB = nullAsUndefined(typeA)
 * ```
 * @param of - the type to convert
 * @returns the desired type that accepts undefined and null as input, and output undefined
 */
export default function nullAsUndefined<T>(of: type.Any<T>) {
  return of.or(type.null.pipe.try(() => undefined))
}
