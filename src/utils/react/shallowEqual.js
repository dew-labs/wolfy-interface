// From https://github.com/facebook/react/blob/c0464aedb16b1c970d717651bba8d1c66c578729/packages/shared/shallowEqual.js

const hasOwnProperty = Object.prototype.hasOwnProperty

const is =
  typeof Object.is === 'function'
    ? Object.is
    : (x, y) => {
        // eslint-disable-next-line no-self-compare -- match original code
        return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
      }

export default function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i]
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      // $FlowFixMe[incompatible-use] lost refinement of `objB`
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false
    }
  }

  return true
}
