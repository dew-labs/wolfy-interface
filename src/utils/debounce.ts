// NOTE: the impementation come from https://github.com/remeda/remeda/blob/fc2fd7e2f2ef0acabc5eba1185b2fc19f537eb6f/src/funnel.remeda-debounce.test.ts since debounce is deprecated in remeda
import {funnel} from 'remeda'

interface Debouncer<F extends (...args: unknown[]) => unknown, IsNullable extends boolean = true> {
  readonly call: (
    ...args: Parameters<F>
  ) => ReturnType<F> | (true extends IsNullable ? undefined : never)
  readonly cancel: () => void
  readonly flush: () => ReturnType<F> | undefined
  readonly isPending: boolean
  readonly cachedValue: ReturnType<F> | undefined
}

interface DebounceOptions {
  readonly waitMs?: number
  readonly maxWaitMs?: number
}

export default function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  options: DebounceOptions & {readonly timing?: 'trailing'},
): Debouncer<F>
export default function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  options:
    | (DebounceOptions & {readonly timing: 'both'})
    | (Omit<DebounceOptions, 'maxWaitMs'> & {readonly timing: 'leading'}),
): Debouncer<F, false /* call CAN'T return null */>
export default function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  {
    timing,
    waitMs,
    maxWaitMs,
  }: DebounceOptions & {readonly timing?: 'both' | 'leading' | 'trailing'},
) {
  if (maxWaitMs !== undefined && waitMs !== undefined && maxWaitMs < waitMs) {
    throw new Error(
      `debounce: maxWaitMs (${maxWaitMs.toString()}) cannot be less than waitMs (${waitMs.toString()})`,
    )
  }

  let cachedValue: ReturnType<F> | undefined

  const debouncingFunnel = funnel(
    (args: Parameters<F>) => {
      // Every time the function is invoked the cached value is updated.
      cachedValue = func(...args) as ReturnType<F>
    },
    {
      // Debounce stores the latest args it was called with for the next
      // invocation of the callback.
      reducer: (_, ...args: Parameters<F>) => args,
      minQuietPeriodMs: waitMs ?? maxWaitMs ?? 0,
      ...(maxWaitMs !== undefined && {maxBurstDurationMs: maxWaitMs}),
      ...(() => {
        switch (timing) {
          case 'leading':
            return {triggerAt: 'start'}
          case 'both':
            return {triggerAt: 'both'}
          case 'trailing':
          case undefined:
            return {triggerAt: 'end'}
        }
      })(),
    },
  )

  return {
    call: (...args: Parameters<F>) => {
      debouncingFunnel.call(...args)
      return cachedValue
    },

    flush: () => {
      debouncingFunnel.flush()
      return cachedValue
    },

    cancel: () => {
      debouncingFunnel.cancel()
    },

    get isPending() {
      return !debouncingFunnel.isIdle
    },

    get cachedValue() {
      return cachedValue
    },
  }
}
