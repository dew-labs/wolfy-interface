import {type Type, type} from 'arktype'

/**
 * Arktype utility to validate search params string.
 *
 * Why?
 * - Originally, search params are all string
 * - However, tanstack router by default will try to convert them to: number, string, boolean, null, array, object, undefined (mean the param is not present)
 * - So, after parsed by tanstack router, there are cases that we already parsed them to other types. For example: `?foo=123` will be parsed to `number` instead of `string`, but it is still a valid string.
 *
 * This type will help you to convert them to the original string.
 * Empty string ('') is allowed.
 */
export default type.unknown.pipe.try(convertToString) as unknown as Type<string>

function convertToString(value: unknown) {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- this is safe now
  return String(value)
}
