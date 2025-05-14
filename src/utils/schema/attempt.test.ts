import {Traversal, type} from 'arktype'
import {describe, expect, it, vi} from 'vitest'

import attempt from './attempt'

describe('attempt runtime tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numberOrZero = attempt(numberType, 0)
    const numberOrFn = attempt(numberType, value =>
      typeof value === 'string' ? parseInt(value) : 1,
    )

    it('should return original value when input is a valid number', () => {
      expect.assertions(1)
      expect(numberOrZero(123)).toBe(123)
    })

    it('should return original value when input is a valid number with function fallback', () => {
      expect.assertions(1)
      expect(numberOrFn(456)).toBe(456)
    })

    it('should return fallback value when input is null', () => {
      expect.assertions(1)
      expect(numberOrZero(null)).toBe(0)
    })

    it('should return fallback value when input is undefined', () => {
      expect.assertions(1)
      expect(numberOrZero(undefined)).toBe(0)
    })

    it('should return fallback value when input is not a number', () => {
      expect.assertions(1)
      expect(numberOrZero('not a number')).toBe(0)
    })

    it('should return default fallback when input is null with function fallback', () => {
      expect.assertions(1)
      expect(numberOrFn(null)).toBe(1)
    })

    it('should parse string to number when possible with function fallback', () => {
      expect.assertions(1)
      expect(numberOrFn('123')).toBe(123)
    })

    it('should return default fallback when input is an empty object', () => {
      expect.assertions(1)
      expect(numberOrFn({})).toBe(1)
    })

    it('should handle NaN values', () => {
      expect.assertions(1)
      expect(numberOrZero(NaN)).toBe(0)
    })

    it('should handle Infinity values', () => {
      expect.assertions(1)
      expect(numberOrZero(Infinity)).toBe(Infinity)
    })
  })

  describe('object type', () => {
    /**
     * Represents a person with a name and age
     */
    interface Person {
      name: string
      age: number
    }

    /**
     * Represents an object with a name property of unknown type
     */
    interface NameRecord {
      name: unknown
    }

    /**
     * Type guard to check if a value is a NameRecord
     *
     * @param value - The value to check
     * @returns True if the value is a NameRecord
     */
    function isNameRecord(value: unknown): value is NameRecord {
      return typeof value === 'object' && value !== null && 'name' in value
    }

    const personType = type({
      name: type.string,
      age: type.number,
    })
    const defaultPerson: Person = {name: 'default', age: 0}
    const personOrDefault = attempt(personType, defaultPerson)
    const personOrFn = attempt(personType, (value: unknown) => {
      if (isNameRecord(value)) {
        // Only keep the required properties
        return {
          name: String(value.name),
          age: 25,
        }
      }
      return defaultPerson
    })

    it('should return original value when input is a valid person', () => {
      expect.assertions(1)

      const validPerson: Person = {name: 'John', age: 30}

      expect(personOrDefault(validPerson)).toEqual(validPerson)
    })

    it('should return original value when input is a valid person with function fallback', () => {
      expect.assertions(1)

      const validPerson: Person = {name: 'John', age: 30}

      expect(personOrFn(validPerson)).toEqual(validPerson)
    })

    it('should return fallback value when input is null', () => {
      expect.assertions(1)
      expect(personOrDefault(null)).toEqual(defaultPerson)
    })

    it('should return fallback value when input has only name', () => {
      expect.assertions(1)
      expect(personOrDefault({name: 'John'} as Person)).toEqual(defaultPerson)
    })

    it('should return fallback value when input has only age', () => {
      expect.assertions(1)
      expect(personOrDefault({age: 30} as Person)).toEqual(defaultPerson)
    })

    it('should return default person when input is null with function fallback', () => {
      expect.assertions(1)
      expect(personOrFn(null)).toEqual(defaultPerson)
    })

    it('should create person with default age when input has only name', () => {
      expect.assertions(1)
      expect(personOrFn({name: 'John'})).toEqual({name: 'John', age: 25})
    })

    it('should convert non-string name to string and use default age', () => {
      expect.assertions(1)
      expect(personOrFn({name: 123})).toEqual({name: '123', age: 25})
    })

    it('should handle empty string name', () => {
      expect.assertions(1)
      expect(personOrFn({name: ''})).toEqual({name: '', age: 25})
    })

    it('should handle object with additional properties', () => {
      expect.assertions(1)

      const input = {name: 'John', age: 30, extra: 'ignored'}

      // Since arktype doesn't strip extra properties by default, we should expect them
      expect(personOrFn(input)).toEqual(input)
    })
  })

  describe('error handling', () => {
    /**
     * Test object with a string test property
     */
    interface TestObject {
      test: string
    }

    const stringType = type.string
    const mockFn = vi.fn((value: unknown, _traversal: Traversal, _t: typeof stringType) => {
      if (typeof value === 'object' && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's safe
        return JSON.stringify(value, (_key, val) => (val === undefined ? null : val))
      }
      return String(value)
    })
    const stringOrFn = attempt(stringType, mockFn)

    it('should pass traversal context with errors when value is invalid', () => {
      expect.assertions(3)

      stringOrFn(123)

      const [value, traversal, t] = mockFn.mock.lastCall ?? []

      expect(value).toBe(123)
      expect(traversal).toBeInstanceOf(Traversal)
      expect(t).toBe(stringType)
    })

    it('should convert object to JSON string when validation fails', () => {
      expect.assertions(1)

      const testObj: TestObject = {test: 'value'}
      const result = stringOrFn(testObj)

      expect(result).toBe('{"test":"value"}')
    })

    it('should pass traversal context with errors when object validation fails', () => {
      expect.assertions(3)

      const testObj: TestObject = {test: 'value'}
      stringOrFn(testObj)

      const [value, traversal, t] = mockFn.mock.lastCall ?? []

      expect(value).toStrictEqual(expect.objectContaining(testObj))
      expect(traversal).toBeInstanceOf(Traversal)
      expect(t).toBe(stringType)
    })

    it('should handle circular references', () => {
      expect.assertions(1)

      const circular: Record<string, unknown> = {a: 1}
      circular.self = circular

      expect(() => stringOrFn(circular)).not.toThrow()
    })

    it('should handle undefined properties', () => {
      expect.assertions(1)

      const obj = {a: undefined, b: null}

      expect(stringOrFn(obj)).toBe('{"a":null,"b":null}')
    })
  })

  describe('array type', () => {
    const numberArrayType = type('number[]')
    const defaultArray = [1, 2, 3]
    const arrayOrDefault = attempt(numberArrayType, defaultArray)
    const arrayOrFn = attempt(numberArrayType, value => {
      if (Array.isArray(value)) {
        return value.map(v => (typeof v === 'number' ? v : 0))
      }
      return defaultArray
    })

    it('should return original array when input is valid number array with default fallback', () => {
      expect.assertions(1)
      expect(arrayOrDefault([4, 5, 6])).toEqual([4, 5, 6])
    })

    it('should return original array when input is valid number array with function fallback', () => {
      expect.assertions(1)
      expect(arrayOrFn([7, 8, 9])).toEqual([7, 8, 9])
    })

    it('should return fallback array when input is null', () => {
      expect.assertions(1)
      expect(arrayOrDefault(null)).toEqual(defaultArray)
    })

    it('should return fallback array when input array contains non-numbers', () => {
      expect.assertions(1)
      expect(arrayOrDefault(['1', '2', '3'])).toEqual(defaultArray)
    })

    it('should convert non-numbers to zero in array with function fallback', () => {
      expect.assertions(1)
      expect(arrayOrFn(['1', 2, '3'])).toEqual([0, 2, 0])
    })

    it('should return default array when input is not an array', () => {
      expect.assertions(1)
      expect(arrayOrFn(123)).toEqual(defaultArray)
    })

    it('should handle empty array', () => {
      expect.assertions(1)
      expect(arrayOrFn([])).toEqual([])
    })

    it('should handle array with undefined and null values', () => {
      expect.assertions(1)
      expect(arrayOrFn([undefined, null, 1])).toEqual([0, 0, 1])
    })
  })

  describe('union type', () => {
    /**
     * Test object with a string key property
     */
    interface TestObject {
      key: string
    }

    const unionType = type.number.or(type.string)
    const defaultValue = 'default'
    const unionOrDefault = attempt(unionType, defaultValue)
    const unionOrFn = attempt(unionType, (value: unknown): string | number => {
      if (value === null || value === undefined) {
        return defaultValue
      }

      const valueType = typeof value
      if (valueType === 'number') {
        return value as number
      }

      if (valueType === 'object') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's ok
          const result = JSON.stringify(value, (_key, val) => (val === undefined ? null : val))
          return result || defaultValue
        } catch {
          return defaultValue
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string -- it's doesn't matter
      return String(value)
    })

    it('should return original number when input is valid number with default fallback', () => {
      expect.assertions(1)
      expect(unionOrDefault(123)).toBe(123)
    })

    it('should return original string when input is valid string with default fallback', () => {
      expect.assertions(1)
      expect(unionOrDefault('test')).toBe('test')
    })

    it('should return original number when input is valid number with function fallback', () => {
      expect.assertions(1)
      expect(unionOrFn(456)).toBe(456)
    })

    it('should return original string when input is valid string with function fallback', () => {
      expect.assertions(1)
      expect(unionOrFn('hello')).toBe('hello')
    })

    it('should return fallback value when input is null with default fallback', () => {
      expect.assertions(1)
      expect(unionOrDefault(null)).toBe(defaultValue)
    })

    it('should return fallback value when input is empty object with default fallback', () => {
      expect.assertions(1)
      expect(unionOrDefault({})).toBe(defaultValue)
    })

    it('should return fallback value when input is null with function fallback', () => {
      expect.assertions(1)
      expect(unionOrFn(null)).toBe(defaultValue)
    })

    it('should convert object to JSON string with function fallback', () => {
      expect.assertions(1)

      const testObj: TestObject = {key: 'value'}

      expect(unionOrFn(testObj)).toBe('{"key":"value"}')
    })

    it('should convert boolean to string with function fallback', () => {
      expect.assertions(1)
      expect(unionOrFn(true)).toBe('true')
    })

    it('should handle circular references gracefully', () => {
      expect.assertions(1)

      const circular: Record<string, unknown> = {a: 1}
      circular.self = circular

      expect(unionOrFn(circular)).toBe(defaultValue)
    })

    it('should handle undefined properties in objects', () => {
      expect.assertions(1)
      expect(unionOrFn({a: undefined, b: null})).toBe('{"a":null,"b":null}')
    })
  })
})
