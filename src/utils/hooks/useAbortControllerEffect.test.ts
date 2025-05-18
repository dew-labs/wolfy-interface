import {renderHook} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'

import useAbortControllerEffect from './useAbortControllerEffect'

describe(useAbortControllerEffect, () => {
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
      useAbortControllerEffect(effect)
    })

    expect(effect).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledWith(expect.any(AbortController))
  })

  it('should call cleanup function on unmount', () => {
    expect.assertions(1)

    const cleanup = vi.fn()
    const effect = vi.fn().mockReturnValue(cleanup)

    const {unmount} = renderHook(() => {
      useAbortControllerEffect(effect)
    })
    unmount()

    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('should set isMounted to false on unmount', () => {
    expect.assertions(2)

    let stateRef: AbortController | undefined

    const effect = vi.fn((abortController: AbortController) => {
      stateRef = abortController
      return () => {
        // Cleanup function
      }
    })

    const {unmount} = renderHook(() => {
      useAbortControllerEffect(effect)
    })

    expect(stateRef?.signal.aborted).toBe(false)

    unmount()

    expect(stateRef?.signal.aborted).toBe(true)
  })

  it('should not run effect if component is unmounted', () => {
    expect.assertions(1)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useAbortControllerEffect(abortController => {
        setTimeout(() => {
          if (!abortController.signal.aborted) effect()
        }, 100)
      })
    })

    unmount()

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(0)
  })

  it('should run effect if component is unmounted but dont use signal check', () => {
    expect.assertions(2)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useAbortControllerEffect(() => {
        setTimeout(() => {
          effect()
        }, 100)
      })
    })

    unmount()

    expect(effect).toHaveBeenCalledTimes(0)

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('should handle dependencies correctly', () => {
    expect.assertions(2)

    const effect = vi.fn()
    const {rerender} = renderHook(
      ({dep}) => {
        useAbortControllerEffect(effect, [dep])
      },
      {initialProps: {dep: 1}},
    )

    expect(effect).toHaveBeenCalledTimes(1)

    rerender({dep: 2})

    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('should work if destructuring signal', () => {
    expect.assertions(1)

    const effect = vi.fn()
    const {unmount} = renderHook(() => {
      useAbortControllerEffect(({signal}) => {
        setTimeout(() => {
          if (!signal.aborted) effect()
        }, 100)
      })
    })

    unmount()

    vi.advanceTimersByTime(200)

    expect(effect).toHaveBeenCalledTimes(0)
  })
})
