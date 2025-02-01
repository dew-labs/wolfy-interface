import {renderHookServer} from '@testing-library/react'
import {expect} from 'vitest'

import useClientValue from './useClientValue'

const DEFAULT_VALUE = 'defaultValue'

describe('useClientValue on server side', () => {
  it('should return default value', () => {
    expect.assertions(3)

    const {result, hydrate} = renderHookServer(() =>
      useClientValue(() => window.innerHeight, DEFAULT_VALUE),
    )

    expect(() => window).toThrow('window is not defined')

    expect(result.current).toBe(DEFAULT_VALUE)

    hydrate()

    expect(result.current).toBe(window.innerHeight)
  })
})
