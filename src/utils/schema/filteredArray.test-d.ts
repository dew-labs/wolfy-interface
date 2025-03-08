import {type Traversal, type} from 'arktype'
import {describe, expectTypeOf, it} from 'vitest'

import filteredArray from './filteredArray'

describe('filteredArray type tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numbersType = filteredArray(numberType)

    it('should handle valid input', () => {
      expectTypeOf(numbersType([1, 2, 3])).toExtend<number[]>()
      expectTypeOf(numbersType(['123', 456, 'foo', 789])).toExtend<number[]>()
    })

    it('should handle invalid input', () => {
      expectTypeOf(numbersType(['foo', 'bar'])).toExtend<number[]>()
      expectTypeOf(numbersType([])).toExtend<number[]>()
    })
  })

  describe('string type with transformation', () => {
    const stringType = type.string.pipe(str => str.toUpperCase())
    const stringsType = filteredArray(stringType)

    it('should handle valid input', () => {
      expectTypeOf(stringsType(['hello', 'world'])).toExtend<string[]>()
      expectTypeOf(stringsType(['a', 'b', 'c'])).toExtend<string[]>()
    })

    it('should handle invalid input', () => {
      expectTypeOf(stringsType([123, 456])).toExtend<string[]>()
      expectTypeOf(stringsType([])).toExtend<string[]>()
    })
  })

  describe('object type', () => {
    interface Person {
      name: string
      age: number
    }

    const personType = type({
      name: type.string,
      age: type.number,
    })
    const peopleType = filteredArray(personType)

    it('should handle valid input', () => {
      expectTypeOf(
        peopleType([
          {name: 'John', age: 30},
          {name: 'Jane', age: 25},
        ]),
      ).toExtend<Person[]>()
    })

    it('should handle invalid input', () => {
      expectTypeOf(peopleType([{name: 'John'}, {age: 25}])).toExtend<Person[]>()
      expectTypeOf(peopleType([])).toExtend<Person[]>()
    })
  })

  describe('error handler', () => {
    const numberType = type.number
    const errorHandler = (_e: import('arktype').ArkErrors, _ctx: Traversal) => {
      console.error('Invalid value encountered')
    }
    const numbersType = filteredArray(numberType, errorHandler)

    it('should handle valid input with error handler', () => {
      expectTypeOf(numbersType([1, 2, 3])).toExtend<number[]>()
    })

    it('should handle invalid input with error handler', () => {
      expectTypeOf(numbersType(['foo', 'bar'])).toExtend<number[]>()
    })
  })

  describe('complex type transformations', () => {
    const dateType = type.string.pipe(str => new Date(str))
    const datesType = filteredArray(dateType)

    it('should handle valid input', () => {
      expectTypeOf(datesType(['2024-03-20', '2024-03-21'])).toExtend<Date[]>()
    })

    it('should handle invalid input', () => {
      expectTypeOf(datesType(['invalid-date', null])).toExtend<Date[]>()
    })
  })

  describe('union type', () => {
    const unionType = type.number.or(type.string)
    const unionArrayType = filteredArray(unionType)

    it('should handle valid input', () => {
      expectTypeOf(unionArrayType([1, 'two', 3, 'four'])).toExtend<(string | number)[]>()
    })

    it('should handle invalid input', () => {
      expectTypeOf(unionArrayType([null, undefined, {}])).toExtend<(string | number)[]>()
    })
  })
})
