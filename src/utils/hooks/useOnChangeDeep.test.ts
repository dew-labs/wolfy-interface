import {renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import useOnChangeDeep from './useOnChangeDeep'

describe(useOnChangeDeep, () => {
  it('should call onChangeFn when value changes using deep equality', () => {
    expect.assertions(2)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep(value as unknown[], onChangeFn)
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

  it('should not call onChangeFn when value stays the same using deep equality', () => {
    expect.assertions(2)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep(value as unknown[], onChangeFn)
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

  it('should call onChangeFn when deeply nested objects change', () => {
    expect.assertions(3)

    const onChangeFn = vi.fn()
    const initialValue = {a: {b: {c: 1}}}
    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep([value] as unknown[], onChangeFn)
      },
      {
        initialProps: {value: initialValue},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Same object reference - should not call onChangeFn
    rerender({value: initialValue})

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Different object with same deep values - should not call onChangeFn (deep equal)
    rerender({value: {a: {b: {c: 1}}}})

    expect(onChangeFn).toHaveBeenCalledTimes(0)
  })

  it('should call onChangeFn when deeply nested objects actually change', () => {
    expect.assertions(4)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep([value] as unknown[], onChangeFn)
      },
      {
        initialProps: {value: {a: {b: {c: 1, d: 2}}}},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Change deep value - should call onChangeFn
    rerender({value: {a: {b: {c: 2, d: 2}}}})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    // Change another deep value - should call onChangeFn again
    rerender({value: {a: {b: {c: 2, d: 3}}}})

    expect(onChangeFn).toHaveBeenCalledTimes(2)

    // Same value again - should not call onChangeFn
    rerender({value: {a: {b: {c: 2, d: 3}}}})

    expect(onChangeFn).toHaveBeenCalledTimes(2)
  })

  it('should call onChangeFn multiple times when value keeps changing', () => {
    expect.assertions(4)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep(value as unknown[], onChangeFn)
      },
      {
        initialProps: {value: [{id: 1}]},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    rerender({value: [{id: 2}]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    rerender({value: [{id: 3}]})

    expect(onChangeFn).toHaveBeenCalledTimes(2)

    rerender({value: [{id: 3}]}) // Same value again

    expect(onChangeFn).toHaveBeenCalledTimes(2) // Should not call again
  })

  it('should handle empty arrays correctly', () => {
    expect.assertions(3)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- its okay */
      ({value}: any) => {
        useOnChangeDeep(value, onChangeFn)
      },
      {
        initialProps: {value: []},
      } as any,
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument  */
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    rerender({value: [{id: 1}]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    rerender({value: []})

    expect(onChangeFn).toHaveBeenCalledTimes(2)
  })

  it('should handle arrays with objects correctly', () => {
    expect.assertions(4)

    const onChangeFn = vi.fn()
    const {rerender} = renderHook(
      ({value}: {value: unknown[]}) => {
        useOnChangeDeep(value, onChangeFn)
      },
      {
        initialProps: {value: [{name: 'Alice', age: 30, city: 'NYC'}]},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Change object property - should call onChangeFn
    rerender({value: [{name: 'Alice', age: 31, city: 'NYC'}]})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    // Change another property - should call onChangeFn
    rerender({value: [{name: 'Alice', age: 31, city: 'LA'}]})

    expect(onChangeFn).toHaveBeenCalledTimes(2)

    // Same value - should not call onChangeFn
    rerender({value: [{name: 'Alice', age: 31, city: 'LA'}]})

    expect(onChangeFn).toHaveBeenCalledTimes(2)
  })

  it('should handle complex nested structures', () => {
    expect.assertions(5)

    const onChangeFn = vi.fn()
    const initialValue = {
      users: [
        {id: 1, profile: {name: 'John', preferences: {theme: 'light'}}},
        {id: 2, profile: {name: 'Jane', preferences: {theme: 'dark'}}},
      ],
      settings: {version: '1.0'},
    }

    const {rerender} = renderHook(
      ({value}) => {
        useOnChangeDeep([value] as unknown[], onChangeFn)
      },
      {
        initialProps: {value: initialValue},
      },
    )

    expect(onChangeFn).toHaveBeenCalledTimes(0)

    // Deep change in nested object - should call onChangeFn
    const changedValue = {
      users: [
        {id: 1, profile: {name: 'John', preferences: {theme: 'dark'}}},
        {id: 2, profile: {name: 'Jane', preferences: {theme: 'dark'}}},
      ],
      settings: {version: '1.0'},
    }
    rerender({value: changedValue})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    // Same value - should not call onChangeFn
    rerender({value: changedValue})

    expect(onChangeFn).toHaveBeenCalledTimes(1)

    // Change in settings - should call onChangeFn
    const settingsChanged = {
      users: [
        {id: 1, profile: {name: 'John', preferences: {theme: 'dark'}}},
        {id: 2, profile: {name: 'Jane', preferences: {theme: 'dark'}}},
      ],
      settings: {version: '1.1'},
    }
    rerender({value: settingsChanged})

    expect(onChangeFn).toHaveBeenCalledTimes(2)

    // Same settings value - should not call onChangeFn
    rerender({value: settingsChanged})

    expect(onChangeFn).toHaveBeenCalledTimes(2)
  })
})
