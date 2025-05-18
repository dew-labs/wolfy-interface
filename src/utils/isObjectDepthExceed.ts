import {isPlainObject} from 'remeda'

/**
 * Returns all own property keys (string and symbol) of an object.
 *
 * @param obj - The object to get keys from.
 * @returns Array of keys (string | symbol).
 */
function getOwnKeys(obj: object): (string | symbol)[] {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)]
}

/**
 * Recursively checks if the depth of an object exceeds maxDepth.
 * Handles Maps, symbol keys, and circular references.
 *
 * @param obj - The current object or value.
 * @param depth - The current depth in the recursion.
 * @param visited - Set of already visited objects to handle cycles.
 * @param maxDepth - The maximum allowed depth.
 * @returns True if depth exceeds maxDepth, false otherwise.
 */
function exceedsDepth(
  obj: unknown,
  depth: number,
  visited: Set<unknown>,
  maxDepth: number,
): boolean {
  if (depth > maxDepth) return true
  if (!isPlainObject(obj) && !(obj instanceof Map)) return false
  if (visited.has(obj)) return depth >= maxDepth
  visited.add(obj)

  const values = obj instanceof Map ? obj.values() : getOwnKeys(obj).map(key => obj[key])

  for (const value of values) {
    if (
      (isPlainObject(value) || value instanceof Map) &&
      exceedsDepth(value, depth + 1, visited, maxDepth)
    ) {
      return true
    }
  }

  // Only remove from visited after all children are checked (no early delete)
  visited.delete(obj)
  return false
}

/**
 * Checks if the depth of an object exceeds a given limit.
 * Handles circular references, Maps, symbol keys, and non-plain objects.
 *
 * @param obj - The object to check.
 * @param maxDepth - The maximum allowed depth.
 * @returns True if the depth exceeds maxDepth, false otherwise.
 */
export default function isObjectDepthExceed(obj: unknown, maxDepth: number): boolean {
  try {
    return exceedsDepth(obj, 1, new Set(), maxDepth)
  } catch {
    // Defensive: If stack overflow or unexpected error, assume depth is exceeded for safety
    return true
  }
}
