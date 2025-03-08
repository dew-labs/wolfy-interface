import {type} from 'arktype'
import {describe, expectTypeOf, it} from 'vitest'

import attempt from './attempt'

describe('attempt type tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numberOrZero = attempt(numberType, 0)
    const numberOrFn = attempt(numberType, (_value, _ctx) => 1)

    it('should handle valid input', () => {
      expectTypeOf(numberOrZero(123)).toExtend<number>()
      expectTypeOf(numberOrFn(123)).toBeNumber()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(numberOrZero(null)).toBeNumber()
      expectTypeOf(numberOrFn(null)).toBeNumber()
      expectTypeOf(numberOrZero(undefined)).toBeNumber()
      expectTypeOf(numberOrFn('not a number')).toBeNumber()
    })
  })

  describe('union type', () => {
    const unionType = type.number.or(type.string)
    const unionOrDefault = attempt(unionType, 'default')
    const unionOrFn = attempt(unionType, (_value, _ctx) => 'fallback')

    it('should handle valid input', () => {
      expectTypeOf(unionOrDefault(123)).toExtend<number | string>()
      expectTypeOf(unionOrDefault('test')).toExtend<number | string>()
      expectTypeOf(unionOrFn(123)).toExtend<number | string>()
      expectTypeOf(unionOrFn('test')).toExtend<number | string>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(unionOrDefault(null)).toExtend<number | string>()
      expectTypeOf(unionOrFn(null)).toExtend<number | string>()
      expectTypeOf(unionOrDefault(undefined)).toExtend<number | string>()
      expectTypeOf(unionOrFn({})).toExtend<number | string>()
    })
  })

  describe('complex object type', () => {
    interface ComplexType {
      name: string
      age: number
    }
    const complexType = type({
      name: type.string,
      age: type.number,
    })
    const defaultValue = {name: 'default', age: 0}
    const complexOrDefault = attempt(complexType, defaultValue)
    const complexOrFn = attempt(
      complexType,
      (_value, _ctx): ComplexType => ({name: 'fallback', age: 1}),
    )

    it('should handle valid input', () => {
      expectTypeOf(complexOrDefault({name: 'test', age: 25})).toExtend<ComplexType>()
      expectTypeOf(complexOrFn({name: 'test', age: 25})).toExtend<ComplexType>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(complexOrDefault(null)).toExtend<ComplexType>()
      expectTypeOf(complexOrFn(null)).toExtend<ComplexType>()
      expectTypeOf(complexOrDefault(undefined)).toExtend<ComplexType>()
      expectTypeOf(complexOrFn({})).toExtend<ComplexType>()
      expectTypeOf(complexOrDefault({name: 'partial'})).toExtend<ComplexType>()
      expectTypeOf(complexOrFn({age: 25})).toExtend<ComplexType>()
    })
  })

  describe('array type', () => {
    const arrayType = type('number[]')
    const defaultArray = [1, 2, 3] as number[]
    const arrayOrDefault = attempt(arrayType, defaultArray)
    const arrayOrFn = attempt(arrayType, (_value, _ctx) => [4, 5, 6])

    it('should handle valid input', () => {
      expectTypeOf(arrayOrDefault([1, 2, 3])).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrFn([1, 2, 3])).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrDefault([])).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrFn([])).toEqualTypeOf<number[]>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(arrayOrDefault(null)).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrFn(null)).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrDefault(undefined)).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrFn(['not', 'numbers'])).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrDefault(123)).toEqualTypeOf<number[]>()
      expectTypeOf(arrayOrFn({})).toEqualTypeOf<number[]>()
    })
  })

  describe('literal type', () => {
    const literalType = type('"hello"')
    const literalOrDefault = attempt(literalType, 'hello' as const)
    const literalOrFn = attempt(literalType, (_value, _ctx) => 'hello' as const)

    it('should handle valid input', () => {
      expectTypeOf(literalOrDefault('hello')).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrFn('hello')).toEqualTypeOf<'hello'>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(literalOrDefault(null)).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrFn(null)).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrDefault(undefined)).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrFn('world')).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrDefault('')).toEqualTypeOf<'hello'>()
      expectTypeOf(literalOrFn(123)).toEqualTypeOf<'hello'>()
    })
  })

  describe('nested object type', () => {
    interface NestedType {
      outer: {inner: number}
    }
    const nestedType = type({
      outer: type({
        inner: type.number,
      }),
    })
    const defaultNested = {outer: {inner: 0}}
    const nestedOrDefault = attempt(nestedType, defaultNested)
    const nestedOrFn = attempt(nestedType, (_value, _ctx): NestedType => ({outer: {inner: 1}}))

    it('should handle valid input', () => {
      expectTypeOf(nestedOrDefault({outer: {inner: 42}})).toExtend<NestedType>()
      expectTypeOf(nestedOrFn({outer: {inner: 42}})).toExtend<NestedType>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(nestedOrDefault(null)).toExtend<NestedType>()
      expectTypeOf(nestedOrFn(null)).toExtend<NestedType>()
      expectTypeOf(nestedOrDefault(undefined)).toExtend<NestedType>()
      expectTypeOf(nestedOrFn({})).toExtend<NestedType>()
      expectTypeOf(nestedOrDefault({outer: {}})).toExtend<NestedType>()
      expectTypeOf(nestedOrFn({outer: null})).toExtend<NestedType>()
      expectTypeOf(nestedOrDefault({outer: {inner: '42'}})).toExtend<NestedType>()
      expectTypeOf(nestedOrFn({outer: {inner: undefined}})).toExtend<NestedType>()
    })
  })

  describe('complex union type', () => {
    interface UserType {
      type: 'user'
      name: string
      age: number
    }
    interface AdminType {
      type: 'admin'
      name: string
      permissions: string[]
    }
    type PersonType = UserType | AdminType

    const userType = type({
      type: type('"user"'),
      name: type.string,
      age: type.number,
    })

    const adminType = type({
      type: type('"admin"'),
      name: type.string,
      permissions: type('string[]'),
    })

    const personType = userType.or(adminType)
    const defaultPerson = {type: 'user' as const, name: 'default', age: 0}
    const personOrDefault = attempt(personType, defaultPerson)
    const personOrFn = attempt(personType, (_value, _ctx) => ({
      type: 'admin' as const,
      name: 'fallback',
      permissions: ['read'],
    }))

    it('should handle valid input', () => {
      expectTypeOf(personOrDefault({type: 'user', name: 'John', age: 25})).toExtend<PersonType>()
      expectTypeOf(
        personOrDefault({type: 'admin', name: 'Admin', permissions: ['read', 'write']}),
      ).toExtend<PersonType>()
      expectTypeOf(personOrFn({type: 'user', name: 'John', age: 25})).toExtend<PersonType>()
      expectTypeOf(
        personOrFn({type: 'admin', name: 'Admin', permissions: ['read', 'write']}),
      ).toExtend<PersonType>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(personOrDefault(null)).toExtend<PersonType>()
      expectTypeOf(personOrFn(undefined)).toExtend<PersonType>()
      expectTypeOf(personOrDefault({type: 'user', name: 'John'})).toExtend<PersonType>()
      expectTypeOf(personOrFn({type: 'admin', name: 'Admin'})).toExtend<PersonType>()
      expectTypeOf(
        personOrDefault({type: 'user', name: 'John', permissions: ['read']}),
      ).toExtend<PersonType>()
      expectTypeOf(personOrFn({type: 'admin', name: 'Admin', age: 25})).toExtend<PersonType>()
      expectTypeOf(personOrDefault({type: 'unknown', name: 'John'})).toExtend<PersonType>()
      expectTypeOf(personOrFn({name: 'John'})).toExtend<PersonType>()
    })
  })

  describe('array of objects', () => {
    interface ItemType {
      id: number
      name: string
      description?: string
      tags?: string[]
    }

    const itemType = type({
      id: type.number,
      name: type.string,
      description: type.string.optional(),
      tags: type('string[]').optional(),
    })

    const defaultItem = {
      id: 1,
      name: 'default',
    } as ItemType

    const arrayType = itemType.array()
    const arrayOrDefault = attempt(arrayType, [defaultItem])
    const arrayOrFn = attempt(arrayType, (_value, _ctx) => [defaultItem])

    it('should handle valid input with optional properties', () => {
      expectTypeOf(
        arrayOrDefault([{id: 1, name: 'test', description: 'desc', tags: ['tag1']}]),
      ).toEqualTypeOf<ItemType[]>()

      expectTypeOf(arrayOrDefault([{id: 1, name: 'test'}])).toEqualTypeOf<ItemType[]>()

      expectTypeOf(arrayOrFn([{id: 1, name: 'test', description: 'desc'}])).toEqualTypeOf<
        ItemType[]
      >()

      expectTypeOf(arrayOrFn([{id: 1, name: 'test', tags: ['tag1']}])).toEqualTypeOf<ItemType[]>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(arrayOrDefault(null)).toEqualTypeOf<ItemType[]>()
      expectTypeOf(arrayOrFn(null)).toEqualTypeOf<ItemType[]>()
      expectTypeOf(arrayOrDefault(undefined)).toEqualTypeOf<ItemType[]>()
      expectTypeOf(arrayOrFn({})).toEqualTypeOf<ItemType[]>()
      expectTypeOf(arrayOrDefault([{name: 'invalid'}])).toEqualTypeOf<ItemType[]>()
      expectTypeOf(arrayOrFn([{id: 1}])).toEqualTypeOf<ItemType[]>()
    })
  })

  describe('mixed types', () => {
    type MixedItem = string | number | {type: string; value: number}
    type MixedArray = MixedItem[]

    const objectType = type({
      type: type.string,
      value: type.number,
    })

    const mixedItemType = type.string.or(type.number).or(objectType)
    const mixedArrayType = type([mixedItemType])
    const defaultMixed = ['default'] as [string]
    const mixedOrDefault = attempt(mixedArrayType, defaultMixed)
    const mixedOrFn = attempt(mixedArrayType, (_value, _ctx) => [42] as [number])

    it('should handle valid mixed content', () => {
      expectTypeOf(mixedOrDefault(['test', 42])).toExtend<MixedArray>()
      expectTypeOf(mixedOrDefault(['test', {type: 'custom', value: 42}])).toExtend<MixedArray>()
      expectTypeOf(mixedOrFn([42, 'test'])).toExtend<MixedArray>()
      expectTypeOf(mixedOrFn([{type: 'custom', value: 42}, 'test', 123])).toExtend<MixedArray>()
    })

    it('should handle invalid input with fallback', () => {
      expectTypeOf(mixedOrDefault(null)).toExtend<MixedArray>()
      expectTypeOf(mixedOrFn(undefined)).toExtend<MixedArray>()
      expectTypeOf(mixedOrDefault([{}])).toExtend<MixedArray>()
      expectTypeOf(mixedOrFn([{type: 'custom'}])).toExtend<MixedArray>()
      expectTypeOf(mixedOrDefault([{value: 42}])).toExtend<MixedArray>()
      expectTypeOf(mixedOrFn([{type: 123, value: '42'}])).toExtend<MixedArray>()
    })
  })

  describe('intersection types', () => {
    interface WithId {
      id: number
    }
    interface WithName {
      name: string
    }
    type Combined = WithId & WithName

    const withIdType = type({id: type.number})
    const withNameType = type({name: type.string})
    const combinedType = withIdType.and(withNameType)

    const defaultCombined = {id: 0, name: 'default'} as Combined
    const combinedOrDefault = attempt(combinedType, defaultCombined)
    const combinedOrFn = attempt(combinedType, (_value, _ctx) => ({id: 1, name: 'fallback'}))

    it('should handle valid intersections', () => {
      expectTypeOf(combinedOrDefault({id: 1, name: 'test'})).toExtend<Combined>()
      expectTypeOf(combinedOrFn({id: 2, name: 'test', extra: true})).toExtend<Combined>()
    })

    it('should handle invalid intersections with fallback', () => {
      expectTypeOf(combinedOrDefault(null)).toExtend<Combined>()
      expectTypeOf(combinedOrFn({id: 1})).toExtend<Combined>()
      expectTypeOf(combinedOrDefault({name: 'test'})).toExtend<Combined>()
      expectTypeOf(combinedOrFn({id: 'not a number', name: 123})).toExtend<Combined>()
    })
  })

  describe('date type', () => {
    const dateType = type.Date
    const defaultDate = new Date(0)
    const dateOrDefault = attempt(dateType, defaultDate)
    const dateOrFn = attempt(dateType, (_value, _ctx) => new Date())

    it('should handle valid date inputs', () => {
      expectTypeOf(dateOrDefault(new Date())).toExtend<Date>()
      expectTypeOf(dateOrFn('2023-01-01')).toExtend<Date>()
      expectTypeOf(dateOrDefault(1704067200000)).toExtend<Date>()
    })

    it('should handle invalid date inputs with fallback', () => {
      expectTypeOf(dateOrDefault(null)).toExtend<Date>()
      expectTypeOf(dateOrFn('invalid date')).toExtend<Date>()
      expectTypeOf(dateOrDefault({})).toExtend<Date>()
      expectTypeOf(dateOrFn(NaN)).toExtend<Date>()
      expectTypeOf(dateOrDefault(Infinity)).toExtend<Date>()
    })
  })

  describe('tuple types', () => {
    const tupleType = type(['number', 'number', 'number?'])
    const defaultTuple = [0, 0] as [number, number]
    const tupleOrDefault = attempt(tupleType, defaultTuple)
    const tupleOrFn = attempt(tupleType, (_value, _ctx) => [1, 1] as [number, number])

    it('should handle valid tuples', () => {
      expectTypeOf(tupleOrDefault([1, 2])).toExtend<[number, number, number?]>()
      expectTypeOf(tupleOrFn([1, 2, 3])).toExtend<[number, number, number?]>()
    })

    it('should handle invalid tuples with fallback', () => {
      expectTypeOf(tupleOrDefault(null)).toExtend<[number, number, number?]>()
      expectTypeOf(tupleOrFn([1])).toExtend<[number, number, number?]>()
      expectTypeOf(tupleOrDefault([1, 'two'])).toExtend<[number, number, number?]>()
      expectTypeOf(tupleOrFn(['one', 2, 3])).toExtend<[number, number, number?]>()
    })
  })

  describe('record types', () => {
    type StringNumberRecord = Record<string, number>
    const recordType = type('object').pipe((obj: object) => {
      const result: Record<string, number> = {}
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'number') result[key] = value
      }
      return result
    })
    const defaultRecord = {default: 0} as StringNumberRecord
    const recordOrDefault = attempt(recordType, defaultRecord)
    const recordOrFn = attempt(recordType, (_value, _ctx) => ({fallback: 1}))

    it('should handle valid records', () => {
      expectTypeOf(recordOrDefault({a: 1, b: 2})).toExtend<StringNumberRecord>()
      expectTypeOf(recordOrFn({x: 10, y: 20, z: 30})).toExtend<StringNumberRecord>()
    })

    it('should handle invalid records with fallback', () => {
      expectTypeOf(recordOrDefault(null)).toExtend<StringNumberRecord>()
      expectTypeOf(recordOrFn([])).toExtend<StringNumberRecord>()
      expectTypeOf(recordOrDefault({a: 'string'})).toExtend<StringNumberRecord>()
      expectTypeOf(recordOrFn({x: null, y: undefined})).toExtend<StringNumberRecord>()
    })
  })

  describe('regex pattern validation', () => {
    const emailPattern = type('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/')
    const defaultEmail = 'default@example.com'
    const emailOrDefault = attempt(emailPattern, defaultEmail)
    const emailOrFn = attempt(emailPattern, (_value, _ctx) => 'fallback@example.com')

    it('should handle valid patterns', () => {
      expectTypeOf(emailOrDefault('test@example.com')).toBeString()
      expectTypeOf(emailOrFn('user.name@domain.co.uk')).toBeString()
    })

    it('should handle invalid patterns with fallback', () => {
      expectTypeOf(emailOrDefault(null)).toBeString()
      expectTypeOf(emailOrFn('invalid-email')).toBeString()
      expectTypeOf(emailOrDefault('@missing-username.com')).toBeString()
      expectTypeOf(emailOrFn('missing-domain@')).toBeString()
    })
  })

  describe('deeply nested arrays', () => {
    const nestedArrayType = type('unknown[]').pipe((arr: unknown[]): number[] => {
      const flatten = (items: unknown[]): number[] => {
        return items.flatMap(item => {
          if (Array.isArray(item)) return flatten([...item])
          return typeof item === 'number' ? [item] : []
        })
      }
      return flatten([...arr])
    })

    const defaultArray = [1, 2, 3] as number[]
    const arrayOrDefault = attempt(nestedArrayType, defaultArray)
    const arrayOrFn = attempt(nestedArrayType, (_value, _ctx) => [4, 5, 6] as number[])

    it('should handle valid nested arrays', () => {
      expectTypeOf(arrayOrDefault([1, [2, 3]])).toExtend<number[]>()
      expectTypeOf(arrayOrFn([1, [2, [3, [4]]]])).toExtend<number[]>()
    })

    it('should handle invalid nested arrays with fallback', () => {
      expectTypeOf(arrayOrDefault(null)).toExtend<number[]>()
      expectTypeOf(arrayOrFn(['1', ['2']])).toExtend<number[]>()
      expectTypeOf(arrayOrDefault([1, {nested: 2}])).toExtend<number[]>()
      expectTypeOf(arrayOrFn([1, [null, [undefined]]])).toExtend<number[]>()
    })
  })

  describe('array length constraints', () => {
    const arrayType = type('number[]').pipe(arr => {
      if (!Array.isArray(arr) || arr.length < 2) return [0, 0]
      if (arr.length > 5) return arr.slice(0, 5)
      return arr
    })
    const defaultArray = [1, 2] as number[]
    const arrayOrDefault = attempt(arrayType, defaultArray)
    const arrayOrFn = attempt(arrayType, (_value, _ctx) => [3, 4])

    it('should handle valid array lengths', () => {
      expectTypeOf(arrayOrDefault([1, 2])).toExtend<number[]>()
      expectTypeOf(arrayOrFn([1, 2, 3])).toExtend<number[]>()
      expectTypeOf(arrayOrDefault([1, 2, 3, 4, 5])).toExtend<number[]>()
    })

    it('should handle invalid array lengths with fallback', () => {
      expectTypeOf(arrayOrDefault([1])).toExtend<number[]>()
      expectTypeOf(arrayOrFn([])).toExtend<number[]>()
      expectTypeOf(arrayOrDefault([1, 2, 3, 4, 5, 6])).toExtend<number[]>()
    })
  })

  describe('custom transformations', () => {
    const transformType = type.string.pipe((value: string) => {
      return value.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    })
    const defaultValue = 'DEFAULT'
    const transformOrDefault = attempt(transformType, defaultValue)
    const transformOrFn = attempt(transformType, (_value, _ctx) => 'FALLBACK')

    it('should handle valid transformations', () => {
      expectTypeOf(transformOrDefault('hello world')).toBeString()
      expectTypeOf(transformOrFn('test@example.com')).toBeString()
    })

    it('should handle invalid transformations with fallback', () => {
      expectTypeOf(transformOrDefault(null)).toBeString()
      expectTypeOf(transformOrFn(123)).toBeString()
      expectTypeOf(transformOrDefault({})).toBeString()
    })
  })

  describe('bigint support', () => {
    const bigIntType = type.bigint
    const defaultBigInt = BigInt(0)
    const bigIntOrDefault = attempt(bigIntType, defaultBigInt)
    const bigIntOrFn = attempt(bigIntType, (_value, _ctx) => BigInt(1))

    it('should handle valid BigInt inputs', () => {
      expectTypeOf(bigIntOrDefault(BigInt(123))).toBeBigInt()
      expectTypeOf(bigIntOrFn('123')).toBeBigInt()
      expectTypeOf(bigIntOrDefault(123)).toBeBigInt()
    })

    it('should handle invalid BigInt inputs with fallback', () => {
      expectTypeOf(bigIntOrDefault(null)).toBeBigInt()
      expectTypeOf(bigIntOrFn('invalid')).toBeBigInt()
      expectTypeOf(bigIntOrDefault({})).toBeBigInt()
      expectTypeOf(bigIntOrFn(Symbol('test'))).toBeBigInt()
    })
  })

  describe('error context handling', () => {
    it('should provide error context in fallback function', () => {
      const numberType = type.number
      const withContext = attempt(numberType, (_value, ctx) => {
        // Test that ctx.errors contains the validation error
        expectTypeOf(ctx.errors).toExtend<type.errors>()

        return 0
      })

      expectTypeOf(withContext('not a number')).toBeNumber()
    })

    it('should handle multiple validation errors in context', () => {
      const complexType = type({
        name: type.string,
        age: type.number,
        email: type('/^[a-z]+@[a-z]+\\.[a-z]+$/'),
      })
      const withErrors = attempt(complexType, (_value, ctx) => {
        // Test that ctx.errors contains all validation errors
        expectTypeOf(ctx.errors).toExtend<type.errors>()

        return {name: 'default', age: 0, email: 'default@test.com'}
      })

      expectTypeOf(withErrors({name: 123, age: 'invalid', email: 'invalid'})).toExtend<{
        name: string
        age: number
        email: string
      }>()
    })
  })

  describe('chained transformations', () => {
    it('should handle chained type transformations', () => {
      const chainedType = type.string
        .pipe((str: string) => str.toUpperCase())
        .pipe((str: string) => str.length)
      const withFallback = attempt(chainedType, 0)

      expectTypeOf(withFallback('test')).toBeNumber()
      expectTypeOf(withFallback(null)).toBeNumber()
    })

    it('should handle complex chained transformations', () => {
      const chainedType = type.string
        .pipe((str: string) => str.split(','))
        .pipe((arr: string[]) => arr.map(Number))
        .pipe((nums: number[]) => nums.reduce((a, b) => a + b, 0))
      const withFallback = attempt(chainedType, 0)

      expectTypeOf(withFallback('1,2,3')).toBeNumber()
      expectTypeOf(withFallback('invalid')).toBeNumber()
    })
  })

  describe('recursive types', () => {
    interface RecursiveType {
      value: number
      next?: RecursiveType | undefined
    }

    it('should handle simple recursive type definitions', () => {
      // Using a more explicit way to define recursive type since type.self is not available
      const recursiveType = type({
        value: type.number,
        next: type({
          value: type.number,
          next: type.undefined.optional(),
        }).optional(),
      })
      const withFallback = attempt(recursiveType, {value: 0})

      expectTypeOf(withFallback({value: 1, next: {value: 2}})).toExtend<RecursiveType>()
      expectTypeOf(withFallback(null)).toExtend<RecursiveType>()
    })

    it('should handle deeply nested recursive structures', () => {
      const recursiveType = type({
        value: type.number,
        next: type({
          value: type.number,
          next: type.undefined.optional(),
        }).optional(),
      })
      const withFallback = attempt(recursiveType, {value: 0})
      const deeplyNested = {
        value: 1,
        next: {
          value: 2,
          next: {
            value: 3,
            next: {
              value: 4,
            },
          },
        },
      }

      expectTypeOf(withFallback(deeplyNested)).toExtend<RecursiveType>()
      expectTypeOf(withFallback({value: 'invalid'})).toExtend<RecursiveType>()
    })
  })

  describe('performance edge cases', () => {
    it('should handle large objects efficiently', () => {
      const recordType = type('object').pipe((obj: object) => obj as Record<string, number>)
      const withFallback = attempt(recordType, {})

      const largeObject = {} as Record<string, number>
      for (let i = 0; i < 1000; i++) largeObject[`key${i}`] = i

      expectTypeOf(withFallback(largeObject)).toExtend<Record<string, number>>()
      expectTypeOf(withFallback(null)).toExtend<Record<string, number>>()
    })

    it('should handle deeply nested structures', () => {
      interface DeepType {
        a: {
          b: {
            c: {
              d: {
                e: string
              }
            }
          }
        }
      }

      const deepType = type({
        a: type({
          b: type({
            c: type({
              d: type({
                e: type.string,
              }),
            }),
          }),
        }),
      })

      const defaultValue: DeepType = {
        a: {b: {c: {d: {e: 'default'}}}},
      }

      const withFallback = attempt(deepType, defaultValue)

      expectTypeOf(withFallback({a: {b: {c: {d: {e: 'test'}}}}})).toExtend<DeepType>()
      expectTypeOf(withFallback({a: {b: {c: {d: {e: 123}}}}})).toExtend<DeepType>()
    })

    it('should handle large arrays of complex objects', () => {
      interface ComplexItem {
        id: number
        name: string
        metadata: Record<string, unknown>
        tags: string[]
        status: 'active' | 'inactive'
      }

      const itemType = type({
        id: type.number,
        name: type.string,
        metadata: type({
          '[string]': type.unknown,
        }),
        tags: type('string[]'),
        status: type('"active"').or(type('"inactive"')),
      })

      const arrayType = itemType.array()
      const defaultItem: ComplexItem = {
        id: 0,
        name: 'default',
        metadata: {},
        tags: [],
        status: 'inactive',
      }

      const withFallback = attempt(arrayType, [defaultItem])

      // Create a large array of items
      const largeArray = Array.from({length: 100}, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        metadata: {key: `value${i}`},
        tags: [`tag${i}`],
        status: i % 2 === 0 ? ('active' as const) : ('inactive' as const),
      }))

      expectTypeOf(withFallback(largeArray)).toExtend<ComplexItem[]>()
      expectTypeOf(withFallback(null)).toExtend<ComplexItem[]>()
    })
  })

  describe('advanced validation scenarios', () => {
    it('should handle conditional validation', () => {
      interface ConditionalType {
        type: 'a' | 'b'
        value: string | number // string for type 'a', number for type 'b'
      }

      const conditionalType = type({
        type: type('"a"').or(type('"b"')),
        value: type.unknown,
      }).pipe((obj: unknown) => {
        const result = obj as ConditionalType
        if (result.type === 'a' && typeof result.value !== 'string') throw new Error()
        if (result.type === 'b' && typeof result.value !== 'number') throw new Error()
        return result
      })

      const withFallback = attempt(conditionalType, {type: 'a', value: ''})

      expectTypeOf(withFallback({type: 'a', value: 'valid'})).toExtend<ConditionalType>()
      expectTypeOf(withFallback({type: 'b', value: 123})).toExtend<ConditionalType>()
      expectTypeOf(withFallback({type: 'a', value: 123})).toExtend<ConditionalType>() // Should use fallback
    })

    it('should handle interdependent field validation', () => {
      interface RangeType {
        min: number
        max: number
      }

      const rangeType = type({
        min: type.number,
        max: type.number,
      }).pipe((obj: unknown) => {
        const result = obj as RangeType
        if (result.min > result.max) throw new Error()
        return result
      })

      const withFallback = attempt(rangeType, {min: 0, max: 100})

      expectTypeOf(withFallback({min: 1, max: 10})).toExtend<RangeType>()
      expectTypeOf(withFallback({min: 10, max: 1})).toExtend<RangeType>() // Should use fallback
    })
  })
})
