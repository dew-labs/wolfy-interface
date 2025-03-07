/**
 * This utility is use to avoid "flash of loading indicator"
 *
 * @param promise - The promise to wait for
 * @param ms - timeout in milliseconds
 * @returns The result of the promise
 */
async function waitAtLeast<T>(promise: Promise<T>, ms = 300): Promise<T> {
  const result = await Promise.allSettled([
    promise,
    new Promise(resolve => {
      setTimeout(resolve, ms)
    }),
  ])

  if (result[0].status === 'rejected') {
    return Promise.reject(result[0].reason as Error)
  }

  return Promise.resolve(result[0].value)
}

export default waitAtLeast
