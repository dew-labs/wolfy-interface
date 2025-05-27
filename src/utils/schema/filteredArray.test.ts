import {type} from 'arktype'
import {describe, expect, it, vi} from 'vitest'

import filteredArray from './filteredArray'

describe('filteredArray runtime tests', () => {
  describe('basic number type', () => {
    const numberType = type.number
    const numbersType = filteredArray(numberType)

    it('should filter out invalid numbers and keep valid ones', () => {
      expect.assertions(1)
      expect(numbersType(['123', 456, 'foo', 789, null, undefined, NaN])).toEqual([456, 789])
    })

    it('should handle empty array', () => {
      expect.assertions(1)
      expect(numbersType([])).toEqual([])
    })

    it('should handle array with all invalid values', () => {
      expect.assertions(1)
      expect(numbersType(['foo', 'bar', null, undefined])).toEqual([])
    })

    it('should handle array with all valid values', () => {
      expect.assertions(1)
      expect(numbersType([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('string type with transformation', () => {
    const stringType = type.string.pipe(str => str.toUpperCase())
    const stringsType = filteredArray(stringType)

    it('should filter and transform valid strings', () => {
      expect.assertions(1)
      expect(stringsType(['hello', 123, 'world', null, ''])).toEqual(['HELLO', 'WORLD', ''])
    })

    it('should handle empty array', () => {
      expect.assertions(1)
      expect(stringsType([])).toEqual([])
    })
  })

  describe('object type', () => {
    const personType = type({
      name: type.string,
      age: type.number,
    })
    const peopleType = filteredArray(personType)

    it('should filter out invalid objects and keep valid ones', () => {
      expect.assertions(1)

      const input = [
        {name: 'John', age: 30},
        {name: 'Jane'},
        {age: 25},
        {name: 'Bob', age: 35},
        null,
        undefined,
      ]

      expect(peopleType(input)).toEqual([
        {name: 'John', age: 30},
        {name: 'Bob', age: 35},
      ])
    })
  })

  describe('error handling', () => {
    const numberType = type.number
    const errorHandler = vi.fn()
    const numbersType = filteredArray(numberType, errorHandler)

    it('should call error handler for each invalid value', () => {
      expect.assertions(2)

      numbersType(['foo', 123, 'bar', 456])

      expect(errorHandler).toHaveBeenCalledTimes(2)
      expect(numbersType(['foo', 123, 'bar', 456])).toEqual([123, 456])
    })

    it('should not call error handler for valid values', () => {
      expect.assertions(2)

      numbersType([1, 2, 3])

      expect(errorHandler).not.toHaveBeenCalled()
      expect(numbersType([1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('complex transformations', () => {
    const dateType = type.string.pipe(str => {
      const date = new Date(str)
      // Check if the date is valid
      if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      return date
    })
    const datesType = filteredArray(dateType)

    it('should filter and transform valid date strings', () => {
      expect.assertions(1)

      const input = ['2024-03-20', 'invalid-date', '2024-03-21', null]
      const result = datesType(input)

      expect(result).toEqual([new Date('2024-03-20'), new Date('2024-03-21')])
    })
  })
})
