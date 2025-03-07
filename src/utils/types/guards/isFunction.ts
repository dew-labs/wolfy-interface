/**
 * A type guard to check if something is a function or not, very helpful when encounter `Type 'T & Function' has no call signatures.` error
 *
 * @param maybeFn - the variable that need to check
 * @returns true if `maybeFn` is a function
 */
export default function isFunction(maybeFn: unknown) {
  return typeof maybeFn === 'function'
}
