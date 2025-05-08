export interface IdleTimeScheduler {
  /**
   * Schedule a task to be executed in the idle time of the browser.
   *
   * @param task - The task to be executed.
   * @returns The id of the scheduled task, this can be used to cancel the task later.
   */
  schedule: (task: () => void) => number
  /**
   * Clear (cancel all) scheduled tasks.
   *
   * @returns The number of tasks that have been cleared.
   */
  clear: () => number
  /**
   * Cancel a scheduled task.
   *
   * @param id - The id of the scheduled task to cancel.
   * @returns True if the task has been cancelled, false otherwise (e.g. the task has already been executed or cancelled, or the id is invalid).
   */
  cancel: (id: number) => boolean
  /**
   * Check if a task has been executed.
   *
   * @param id - The id of the scheduled task to check.
   * @returns True if the task has been executed, false otherwise.
   */
  isExecuted: (id: number) => boolean
  /**
   * Check if a task has been cancelled.
   *
   * @param id - The id of the scheduled task to check.
   * @returns True if the task has been cancelled, false otherwise.
   */
  isCanceled: (id: number) => boolean
  /**
   * The number of scheduled tasks.
   */
  size: () => number
  /**
   * The number of tasks that have been executed.
   */
  executed: () => number
  /**
   * The number of tasks that have been cancelled.
   */
  cancelled: () => number
  /**
   * The number of tasks that have been scheduled.
   */
  scheduled: () => number
  /**
   * The number of tasks that have been remaining.
   */
  remaining: () => number
}

/**
 * Creates a scheduler that schedules tasks to be executed in the idle time of the browser.
 *
 * @param timeout - The timeout for the scheduler. If the number of milliseconds represented by this parameter has elapsed and the callback has not already been called, then a task to execute the callback is queued in the event loop (even if doing so risks causing a negative performance impact)
 * @returns The scheduler instance
 */
const createIdleTimeScheduler = (timeout = 3000): IdleTimeScheduler => {
  const tasks: {execute: () => void; id: number; isCancelled?: boolean}[] = []
  const abortControllers = new Map<number, AbortController>()

  const executed = new Set<number>()
  const canceled = new Set<number>()

  let isRequestIdleCallbackScheduled = false
  let currentId = 0
  let scheduled = 0

  const runScheduler = () => {
    // Only schedule the rIC if one has not already been set.
    if (isRequestIdleCallbackScheduled) return

    isRequestIdleCallbackScheduled = true

    if ('requestIdleCallback' in globalThis) {
      // Wait at most two seconds before processing events.

      return requestIdleCallback(process, {timeout})
    }

    return setTimeout(process, 0)
  }

  const process = (deadline?: IdleDeadline) => {
    // Reset the boolean so future rICs can be set.
    isRequestIdleCallbackScheduled = false

    // If there is no deadline, just run as long as necessary.
    // This will be the case if requestIdleCallback doesn't exist.
    deadline ??= {
      didTimeout: false,
      timeRemaining() {
        return Number.MAX_VALUE
      },
    }

    // Go for as long as there is time remaining and work to do.
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
      const task = tasks.pop()
      if (task) {
        if (task.isCancelled) continue

        try {
          task.execute()
        } catch (error) {
          console.error('Error executing scheduled task:', error)
        }
      }
    }

    // Check if there are more events still to send.
    if (tasks.length > 0) runScheduler()
  }

  const schedule = (task: () => void) => {
    const id = currentId++
    scheduled++

    const modifiedTask = () => {
      task()
      executed.add(id)
      abortControllers.delete(id)
    }

    if ('scheduler' in globalThis) {
      const abortController = new AbortController()
      abortControllers.set(id, abortController)

      try {
        // @ts-expect-error - type is not available yet https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1249
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- explanation above
        globalThis.scheduler
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- explanation above
          .postTask(modifiedTask, {
            priority: 'background',
            signal: abortController.signal,
            delay: 0,
          })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- explanation above
          .catch((error: unknown) => {
            console.error('Error in scheduled task:', error)
          })
      } catch (error) {
        console.error('Error scheduling task:', error)
        throw error
      }
    } else {
      tasks.push({execute: modifiedTask, id})
      runScheduler()
    }
    return id
  }

  const clear = () => {
    const count = tasks.length
    for (const task of tasks) {
      task.isCancelled = true
      canceled.add(task.id)
    }
    // Clean up all abort controllers
    for (const [id, controller] of abortControllers.entries()) {
      controller.abort()
      canceled.add(id)
    }
    abortControllers.clear()
    return count
  }

  const cancel = (id: number) => {
    const abortController = abortControllers.get(id)

    if (abortController) {
      try {
        abortController.abort()
        abortControllers.delete(id)
      } catch (error) {
        console.error('Error cancelling task:', error)
        return false
      }
    } else {
      const taskId = tasks.findIndex(thing => thing.id === id)
      if (taskId !== -1 && tasks[taskId]) {
        tasks[taskId].isCancelled = true
      } else {
        return false
      }
    }

    canceled.add(id)
    return true
  }

  const isExecuted = (id: number) => executed.has(id)
  const isCanceled = (id: number) => canceled.has(id)

  return {
    schedule,
    clear,
    cancel,
    isExecuted,
    isCanceled,
    size: () => tasks.length,
    executed: () => executed.size,
    cancelled: () => canceled.size,
    scheduled: () => scheduled,
    remaining: () => tasks.length + abortControllers.size,
  }
}

export default createIdleTimeScheduler
