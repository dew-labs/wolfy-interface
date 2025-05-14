import {type} from 'arktype'
import {describe, expect, it} from 'vitest'

import nullAsUndefined from './nullAsUndefined'

describe('nullAsUndefined runtime tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numberOrUndefined = nullAsUndefined(numberType)

    it('should handle valid input', () => {
      expect.assertions(1)

      const input = 123
      const result = numberOrUndefined(input)

      expect(result).toBe(123)
    })

    it('should handle null input', () => {
      expect.assertions(1)

      const nullResult = numberOrUndefined(null)

      expect(nullResult).toBeUndefined()
    })

    it('should handle invalid input', () => {
      expect.assertions(1)

      const input = 'not a number'
      const result = numberOrUndefined(input)

      expect(result).toBeInstanceOf(type.errors)
    })
  })

  describe('object type', () => {
    const objectType = type({
      name: 'string',
      age: 'number',
    })
    const objectOrUndefined = nullAsUndefined(objectType)

    it('should handle valid input', () => {
      expect.assertions(1)

      const validObject = {name: 'John', age: 30}
      const result = objectOrUndefined(validObject)

      expect(result).toEqual(validObject)
    })

    it('should handle null input', () => {
      expect.assertions(1)

      const nullResult = objectOrUndefined(null)

      expect(nullResult).toBeUndefined()
    })

    it('should handle invalid input', () => {
      expect.assertions(1)

      const invalidObject = {name: 'John', age: 'thirty'}
      const result = objectOrUndefined(invalidObject)

      expect(result).toBeInstanceOf(type.errors)
    })

    it('should handle partial object input', () => {
      expect.assertions(1)

      const partialObject = {name: 'John'}
      const result = objectOrUndefined(partialObject)

      expect(result).toBeInstanceOf(type.errors)
    })
  })

  describe('union type', () => {
    const unionType = type('string|number')
    const unionOrUndefined = nullAsUndefined(unionType)

    it('should handle valid string input', () => {
      expect.assertions(1)

      const input = 'test'
      const result = unionOrUndefined(input)

      expect(result).toBe('test')
    })

    it('should handle valid number input', () => {
      expect.assertions(1)

      const input = 42
      const result = unionOrUndefined(input)

      expect(result).toBe(42)
    })

    it('should handle null and undefined input', () => {
      expect.assertions(1)

      const nullResult = unionOrUndefined(null)

      expect(nullResult).toBeUndefined()
    })

    it('should handle invalid input', () => {
      expect.assertions(1)

      const input = true
      const result = unionOrUndefined(input)

      expect(result).toBeInstanceOf(type.errors)
    })
  })

  describe('array type', () => {
    const arrayType = type('number[]')
    const arrayOrUndefined = nullAsUndefined(arrayType)

    it('should handle valid array input', () => {
      expect.assertions(1)

      const validArray = [1, 2, 3]
      const result = arrayOrUndefined(validArray)

      expect(result).toEqual(validArray)
    })

    it('should handle empty array', () => {
      expect.assertions(1)

      const emptyArray: number[] = []
      const result = arrayOrUndefined(emptyArray)

      expect(result).toEqual(emptyArray)
    })

    it('should handle null input', () => {
      expect.assertions(1)

      const nullResult = arrayOrUndefined(null)

      expect(nullResult).toBeUndefined()
    })

    it('should handle invalid array input', () => {
      expect.assertions(1)

      const invalidArray = [1, '2', 3]
      const result = arrayOrUndefined(invalidArray)

      expect(result).toBeInstanceOf(type.errors)
    })
  })

  describe('literal type', () => {
    const literalType = type('"foo"|"bar"|1|2')
    const literalOrUndefined = nullAsUndefined(literalType)

    it('should handle valid string literal input', () => {
      expect.assertions(2)

      const input1 = 'foo'
      const input2 = 'bar'
      const result1 = literalOrUndefined(input1)
      const result2 = literalOrUndefined(input2)

      expect(result1).toBe('foo')
      expect(result2).toBe('bar')
    })

    it('should handle valid number literal input', () => {
      expect.assertions(2)

      const input1 = 1
      const input2 = 2
      const result1 = literalOrUndefined(input1)
      const result2 = literalOrUndefined(input2)

      expect(result1).toBe(1)
      expect(result2).toBe(2)
    })

    it('should handle null and undefined input', () => {
      expect.assertions(1)

      const nullInput = null
      const nullResult = literalOrUndefined(nullInput)

      expect(nullResult).toBeUndefined()
    })

    it('should handle invalid literal input', () => {
      expect.assertions(2)

      const input1 = 'baz'
      const input2 = 3

      const result1 = literalOrUndefined(input1)
      const result2 = literalOrUndefined(input2)

      expect(result1).toBeInstanceOf(type.errors)
      expect(result2).toBeInstanceOf(type.errors)
    })
  })

  describe('nested object type', () => {
    const nestedType = type({
      user: {
        profile: {
          name: 'string',
          age: 'number',
        },
        settings: {
          theme: '"light"|"dark"',
          notifications: 'boolean',
        },
      },
    })
    const nestedOrUndefined = nullAsUndefined(nestedType)

    it('should handle valid nested object input', () => {
      expect.assertions(1)

      const validObject = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
          settings: {
            theme: 'light',
            notifications: true,
          },
        },
      }
      const result = nestedOrUndefined(validObject)

      expect(result).toEqual(validObject)
    })

    it('should handle null input', () => {
      expect.assertions(1)

      const nullResult = nestedOrUndefined(null)

      expect(nullResult).toBeUndefined()
    })

    it('should handle partial nested object input', () => {
      expect.assertions(1)

      const partialObject = {
        user: {
          profile: {
            name: 'John',
          },
        },
      }
      const result = nestedOrUndefined(partialObject)

      expect(result).toBeInstanceOf(type.errors)
    })
  })
})
