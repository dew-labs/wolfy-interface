import {renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import useOnChange from './useOnChange'

describe(useOnChange, () => {
  it('should call onChangeFn when value changes using shallow equality', () => {
    expect.assertions(2)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange(value, onChangeFn)
      },
      {
        initialProps: {value: [1, 2, 3]},
      },
    )

    // Initial render - onChangeFn should not be called yet since prevValue equals current value
    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Change the value - onChangeFn should be called
    rerender({value: [1, 2, 4]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)
  })

  it('should not call onChangeFn when value stays the same', () => {
    expect.assertions(2)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange(value, onChangeFn)
      },
      {
        initialProps: {value: [1, 2, 3]},
      },
    )

    // Initial render - onChangeFn should not be called yet
    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Rerender with same value - onChangeFn should not be called
    rerender({value: [1, 2, 3]})

    expect(onChangeFn).toHaveBeenCalledTimes(0)
  })

  it('should call onChangeFn when object references change but values are shallow equal', () => {
    expect.assertions(3)

    const onChangeFn = vi.fn()
    const initialValue = {a: 1, b: 2}
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange([value], onChangeFn)
      },
      {
        initialProps: {value: initialValue},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Same object reference - should not call onChangeFn
    rerender({value: initialValue})

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Different object with same values - should call onChangeFn
    rerender({value: {a: 1, b: 2}})

    expect(onChangeFn).toHaveBeenCalledTimes(1)
  })

  it('should call onChangeFn multiple times when value keeps changing', () => {
    expect.assertions(4)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange(value, onChangeFn)
      },
      {
        initialProps: {value: [1]},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    rerender({value: [2]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    rerender({value: [3]})

    expect(onChangeFn).toHaveBeenCalledTimes(2)

    rerender({value: [3]}) // Same value again

    expect(onChangeFn).toHaveBeenCalledTimes(2) // Should not call again
  })

  it('should handle empty arrays correctly', () => {
    expect.assertions(3)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange(value, onChangeFn)
      },
      {
        initialProps: {value: [] as unknown[]},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    rerender({value: [1]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    rerender({value: []})

    expect(onChangeFn).toHaveBeenCalledTimes(2)
  })

  it('should handle primitive values in arrays', () => {
    expect.assertions(3)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChange(value, onChangeFn)
      },
      {
        initialProps: {value: ['a', 'b']},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    rerender({value: ['a', 'c']})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    rerender({value: ['a', 'c']}) // Same value

    expect(onChangeFn).toHaveBeenCalledTimes(1)
  })
})
