import {describe, expect, it} from 'vitest'

import isObjectDepthExceed from './isObjectDepthExceed'

// Recursive type for nested object
interface Nested {
  nested?: Nested
}

// Helper to create nested objects
function createNestedObject(depth: number): Nested {
  const obj: Nested = {}
  let current: Nested = obj
  for (let i = 1; i < depth; i++) {
    current.nested = {}
    current = current.nested
  }
  return obj
}

describe(isObjectDepthExceed, () => {
  it('returns false for flat object (depth 1)', () => {
    expect.assertions(2)

    expect(isObjectDepthExceed({a: 1, b: 2}, 1)).toBe(false)
    expect(isObjectDepthExceed({a: 1, b: 2}, 2)).toBe(false)
  })

  it('returns true for nested object exceeding depth', () => {
    expect.assertions(2)

    const obj = {a: {b: {c: 1}}}

    expect(isObjectDepthExceed(obj, 2)).toBe(true)
    expect(isObjectDepthExceed(obj, 3)).toBe(false)
  })

  it('returns false for object with depth exactly n', () => {
    expect.assertions(1)

    const obj = createNestedObject(3)

    expect(isObjectDepthExceed(obj, 3)).toBe(false)
  })

  it('returns true for object with depth greater than n', () => {
    expect.assertions(1)

    const obj = createNestedObject(4)

    expect(isObjectDepthExceed(obj, 3)).toBe(true)
  })

  it('returns true if a circular reference is encountered at or beyond the specified depth', () => {
    expect.assertions(3)

    // Depth 1: obj
    // Depth 2: obj.a
    // Depth 3: obj.a.b (circular back to obj)
    const obj: Record<string, unknown> = {a: {}}
    const aObj = obj.a as Record<string, unknown>
    aObj.b = obj

    // Circular reference at depth 3, n = 3
    expect(isObjectDepthExceed(obj, 3)).toBe(true)
    // Circular reference at depth 2, n = 2
    expect(isObjectDepthExceed(obj, 2)).toBe(true)
    // Circular reference at depth 3, n = 4 (should be false, as we never reach depth 4)
    expect(isObjectDepthExceed(obj, 4)).toBe(false)
  })

  it('returns false if a circular reference is encountered before the specified depth', () => {
    expect.assertions(1)

    // obj -> a (circular back to obj)
    const obj: Record<string, unknown> = {a: {}}
    const aObj = obj.a as Record<string, unknown>
    aObj.b = obj

    // n = 5, but max depth is 3 (obj -> a -> b)
    expect(isObjectDepthExceed(obj, 5)).toBe(false)
  })

  it('handles Map objects', () => {
    expect.assertions(2)

    const map = new Map()
    map.set('a', {b: {c: 1}})

    expect(isObjectDepthExceed(map, 2)).toBe(true)
    expect(isObjectDepthExceed(map, 3)).toBe(false)
  })

  it('returns false for non-object values', () => {
    expect.assertions(3)
    expect(isObjectDepthExceed(42, 1)).toBe(false)
    expect(isObjectDepthExceed('string', 1)).toBe(false)
    expect(isObjectDepthExceed(true, 1)).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect.assertions(2)
    expect(isObjectDepthExceed(null, 1)).toBe(false)
    expect(isObjectDepthExceed(undefined, 1)).toBe(false)
  })

  it('does not count arrays as objects', () => {
    expect.assertions(3)
    expect(isObjectDepthExceed([1, 2, 3], 1)).toBe(false)
    expect(isObjectDepthExceed({a: [1, 2, 3]}, 2)).toBe(false)
    expect(isObjectDepthExceed({a: [{b: 2}]}, 2)).toBe(false)
  })

  it('returns false for empty object and empty map', () => {
    expect.assertions(2)
    expect(isObjectDepthExceed({}, 1)).toBe(false)
    expect(isObjectDepthExceed(new Map(), 1)).toBe(false)
  })

  it('handles objects with functions, symbols, and dates', () => {
    expect.assertions(2)

    const obj = {
      fn() {
        return 42
      },
      sym: Symbol('s'),
      date: new Date(),
    }

    expect(isObjectDepthExceed(obj, 1)).toBe(false)
    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('ignores non-enumerable properties', () => {
    expect.assertions(1)

    const obj = {}
    Object.defineProperty(obj, 'hidden', {
      value: {deep: 1},
      enumerable: false,
    })

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('does not traverse prototype chain', () => {
    expect.assertions(1)

    const proto: {deep: {a: number}} = {deep: {a: 1}}
    const obj = Object.create(proto) as {deep?: {a: number}}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles objects with symbol keys', () => {
    expect.assertions(1)

    const sym = Symbol('deep')
    const obj = {[sym]: {a: 1}}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles self-referencing root object', () => {
    expect.assertions(1)

    interface SelfRef {
      self?: SelfRef
    }
    const obj: SelfRef = {}
    obj.self = obj

    expect(isObjectDepthExceed(obj, 2)).toBe(true)
  })

  it('handles very large depth values gracefully', () => {
    expect.assertions(2)

    const obj = createNestedObject(1000)

    expect(isObjectDepthExceed(obj, 1000)).toBe(false)
    expect(isObjectDepthExceed(obj, 999)).toBe(true)
  })

  it('handles objects with both enumerable and non-enumerable properties at the same level', () => {
    expect.assertions(1)

    const obj = {a: {b: 1}}
    Object.defineProperty(obj, 'hidden', {
      value: {deep: 2},
      enumerable: false,
    })

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles objects with both string and symbol keys at the same level', () => {
    expect.assertions(1)

    const sym = Symbol('deep')
    const obj = {a: {b: 1}, [sym]: {c: 2}}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('ignores getter/setter properties', () => {
    expect.assertions(1)

    const obj = {
      get deep() {
        return {a: 1}
      },
    }

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles objects with null prototype', () => {
    expect.assertions(1)

    const obj = Object.create(null) as Record<string, unknown>
    obj.a = {b: 1}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('does not mutate the input object', () => {
    expect.assertions(1)

    const obj = {a: {b: 1}}
    const clone = JSON.parse(JSON.stringify(obj))
    isObjectDepthExceed(obj, 2)

    expect(obj).toEqual(clone)
  })

  it('handles objects with unicode keys', () => {
    expect.assertions(1)

    const obj = {ключ: {b: 1}}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles wide objects (many keys at each level)', () => {
    expect.assertions(1)

    const obj = {a: {b: 1}, c: {d: 2}, e: {f: 3}, g: {h: 4}, i: {j: 5}}

    expect(isObjectDepthExceed(obj, 2)).toBe(false)
  })

  it('handles frozen and sealed objects', () => {
    expect.assertions(2)

    const frozen = Object.freeze({a: {b: 1}})
    const sealed = Object.seal({a: {b: 1}})

    expect(isObjectDepthExceed(frozen, 2)).toBe(false)
    expect(isObjectDepthExceed(sealed, 2)).toBe(false)
  })
})
