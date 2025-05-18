import {renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import useMountedEffect from './useMountedEffect'

describe(useMountedEffect, () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should run effect on mount', () => {
    expect.assertions(2)

    const effect = vi.fn()
    renderHook(() => {
      useMountedEffect(effect)
    })

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith(
      expect.objectContaining({
        current: true,
      }),
    )
  })

  it('should call cleanup function on unmount', () => {
    expect.assertions(1)

    const cleanup = vi.fn()
    const effect = vi.fn().mockReturnValue(cleanup)

    const {unmount} = renderHook(() => {
      useMountedEffect(effect)
    })
    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should set isMounted to false on unmount', () => {
    expect.assertions(2)

    let isMountedRef: {current: boolean} | undefined

    const effect = vi.fn((isMounted: {current: boolean}) => {
      isMountedRef = isMounted
      return () => {
        // Cleanup function
      }
    })

    const {unmount} = renderHook(() => {
      useMountedEffect(effect)
    })

    expect(isMountedRef?.current).toBe(true)

    unmount()

    expect(isMountedRef?.current).toBe(false)
  })

  it('should not run effect if component is unmounted', () => {
    expect.assertions(1)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useMountedEffect(isMounted => {
        setTimeout(() => {
          if (isMounted.current) effect()
        }, 100)
      })
    })

    unmount()

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(0)
  })

  it('should run effect if component is unmounted but dont use `isMounted` check', () => {
    expect.assertions(1)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useMountedEffect(() => {
        setTimeout(() => {
          effect()
        }, 100)
      })
    })

    unmount()

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('should handle dependencies correctly', () => {
    expect.assertions(2)

    const effect = vi.fn()
    const {rerender} = renderHook(
      ({dep}) => {
        useMountedEffect(effect, [dep])
      },
      {initialProps: {dep: 1}},
    )

    expect(effect).toHaveBeenCalledTimes(1)

    rerender({dep: 2})

    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('should not work if destructuring isMounted', () => {
    expect.assertions(1)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useMountedEffect(({current}) => {
        setTimeout(() => {
          if (current) effect()
        }, 100)
      })
    })

    unmount()

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(1)
  })
})
