import {type} from 'arktype'
import {describe, expectTypeOf, it} from 'vitest'

import nullAsUndefined from './nullAsUndefined'

describe('nullAsUndefined type tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numberOrUndefined = nullAsUndefined(numberType)

    it('should handle valid input', () => {
      const input = 123
      const result = numberOrUndefined(input)

      expectTypeOf(result).toExtend<number | undefined>()
      expectTypeOf(result).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = numberOrUndefined(nullInput)
      const undefinedResult = numberOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<number | undefined>()
      expectTypeOf(undefinedResult).toExtend<number | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input = 'not a number'
      const result = numberOrUndefined(input)

      expectTypeOf(result).toExtend<number | undefined>()
      expectTypeOf(result).not.toExtend<string>()
      expectTypeOf(result).not.toExtend<null>()
    })
  })

  describe('object type', () => {
    interface Person {
      name: string
      age: number
    }

    const objectType = type({
      name: 'string',
      age: 'number',
    })
    const objectOrUndefined = nullAsUndefined(objectType)

    it('should handle valid input', () => {
      const input = {name: 'John', age: 30}
      const result = objectOrUndefined(input)

      expectTypeOf(result).toExtend<Person | undefined>()
      expectTypeOf(result).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = objectOrUndefined(nullInput)
      const undefinedResult = objectOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<Person | undefined>()
      expectTypeOf(undefinedResult).toExtend<Person | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input = {name: 'John', age: 'thirty'}
      const result = objectOrUndefined(input)

      expectTypeOf(result).toExtend<Person | undefined>()
      expectTypeOf(result).not.toExtend<{name: string; age: string}>()
      expectTypeOf(result).not.toExtend<null>()
    })
  })

  describe('union type', () => {
    const unionType = type('string|number')
    type UnionType = typeof unionType.infer
    const unionOrUndefined = nullAsUndefined(unionType)

    it('should handle valid input', () => {
      const stringInput = 'test'
      const numberInput = 42
      const stringResult = unionOrUndefined(stringInput)
      const numberResult = unionOrUndefined(numberInput)

      expectTypeOf(stringResult).toExtend<UnionType | undefined>()
      expectTypeOf(numberResult).toExtend<UnionType | undefined>()
      expectTypeOf(stringResult).not.toExtend<null>()
      expectTypeOf(numberResult).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = unionOrUndefined(nullInput)
      const undefinedResult = unionOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<UnionType | undefined>()
      expectTypeOf(undefinedResult).toExtend<UnionType | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input = true
      const result = unionOrUndefined(input)

      expectTypeOf(result).toExtend<UnionType | undefined>()
      expectTypeOf(result).not.toExtend<boolean>()
      expectTypeOf(result).not.toExtend<null>()
    })
  })

  describe('array type', () => {
    const arrayType = type('number[]')
    const arrayOrUndefined = nullAsUndefined(arrayType)

    it('should handle valid input', () => {
      const input = [1, 2, 3]
      const result = arrayOrUndefined(input)

      expectTypeOf(result).toExtend<number[] | undefined>()
      expectTypeOf(result).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = arrayOrUndefined(nullInput)
      const undefinedResult = arrayOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<number[] | undefined>()
      expectTypeOf(undefinedResult).toExtend<number[] | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input = [1, '2', 3]
      const result = arrayOrUndefined(input)

      expectTypeOf(result).toExtend<number[] | undefined>()
      expectTypeOf(result).not.toExtend<(number | string)[]>()
      expectTypeOf(result).not.toExtend<null>()
    })
  })

  describe('literal type', () => {
    const literalType = type('"foo"|"bar"|1|2')
    const literalOrUndefined = nullAsUndefined(literalType)

    type ValidLiteral = 'foo' | 'bar' | 1 | 2

    it('should handle valid input', () => {
      const input1 = 'foo'
      const input2 = 1
      const result1 = literalOrUndefined(input1)
      const result2 = literalOrUndefined(input2)

      expectTypeOf(result1).toExtend<ValidLiteral | undefined>()
      expectTypeOf(result2).toExtend<ValidLiteral | undefined>()
      expectTypeOf(result1).not.toExtend<null>()
      expectTypeOf(result2).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = literalOrUndefined(nullInput)
      const undefinedResult = literalOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<ValidLiteral | undefined>()
      expectTypeOf(undefinedResult).toExtend<ValidLiteral | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input1 = 'baz'
      const input2 = 3
      const result1 = literalOrUndefined(input1)
      const result2 = literalOrUndefined(input2)

      expectTypeOf(result1).toExtend<ValidLiteral | undefined>()
      expectTypeOf(result2).toExtend<ValidLiteral | undefined>()
      expectTypeOf(result1).not.toExtend<string>()
      expectTypeOf(result2).not.toExtend<number>()
      expectTypeOf(result1).not.toExtend<null>()
      expectTypeOf(result2).not.toExtend<null>()
    })
  })

  describe('nested object type', () => {
    interface User {
      profile: {
        name: string
        age: number
      }
      settings: {
        theme: 'light' | 'dark'
        notifications: boolean
      }
    }

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

    it('should handle valid input', () => {
      const input = {
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
      const result = nestedOrUndefined(input)

      expectTypeOf(result).toExtend<{user: User} | undefined>()
      expectTypeOf(result).not.toExtend<null>()
    })

    it('should handle null and undefined input', () => {
      const nullInput = null
      const undefinedInput = undefined
      const nullResult = nestedOrUndefined(nullInput)
      const undefinedResult = nestedOrUndefined(undefinedInput)

      expectTypeOf(nullResult).toExtend<{user: User} | undefined>()
      expectTypeOf(undefinedResult).toExtend<{user: User} | undefined>()
      expectTypeOf(nullResult).not.toExtend<null>()
      expectTypeOf(undefinedResult).not.toExtend<null>()
    })

    it('should handle invalid input', () => {
      const input = {
        user: {
          profile: {
            name: 'John',
            age: '30', // invalid type
          },
          settings: {
            theme: 'blue', // invalid literal
            notifications: true,
          },
        },
      }
      const result = nestedOrUndefined(input)

      expectTypeOf(result).toExtend<{user: User} | undefined>()
      expectTypeOf(result).not.toExtend<{
        user: {
          profile: {name: string; age: string}
          settings: {theme: string; notifications: boolean}
        }
      }>()
      expectTypeOf(result).not.toExtend<null>()
    })
  })
})
