import {renderHook} from '@testing-library/react'
import {expect} from 'vitest'

import useClientValue, {useMemoClientValue} from './useClientValue'

const DEFAULT_VALUE = 'defaultValue'

describe('useClientValue should works', () => {
  it('on client side', () => {
    expect.assertions(1)

    const {result} = renderHook(() => useClientValue(() => window.innerHeight, DEFAULT_VALUE))

    expect(result.current).toBe(window.innerHeight)
  })

  it('on client side with value change every render', () => {
    expect.assertions(2)

    // eslint-disable-next-line sonarjs/pseudo-random -- it's safe
    const {result, rerender} = renderHook(() => useClientValue(() => Math.random(), DEFAULT_VALUE))

    const firstRenderResult = result.current

    rerender()

    const secondRenderResult = result.current

    expect(secondRenderResult).not.toBe(firstRenderResult)

    rerender()

    expect(result.current).not.toBe(secondRenderResult)
  })
})

describe('useMemoClientValue should works', () => {
  it('on client side with value change every render and deps remain the same', () => {
    expect.assertions(2)

    const {result, rerender} = renderHook(() =>
      // eslint-disable-next-line sonarjs/pseudo-random -- it's safe
      useMemoClientValue(() => Math.random(), [], DEFAULT_VALUE),
    )

    const firstRenderResult = result.current

    rerender()

    expect(result.current).toBe(firstRenderResult)

    rerender()

    expect(result.current).toBe(firstRenderResult)
  })

  it('on client side with value change every render and deps that change', () => {
    expect.assertions(2)

    const {result, rerender} = renderHook(
      // eslint-disable-next-line sonarjs/pseudo-random, react-hooks/exhaustive-deps -- it's safe
      deps => useMemoClientValue(() => Math.random(), deps, DEFAULT_VALUE),
      {initialProps: [1]},
    )

    const firstRenderResult = result.current

    rerender([1])

    expect(result.current).toBe(firstRenderResult)

    rerender([2])

    expect(result.current).not.toBe(firstRenderResult)
  })
})
