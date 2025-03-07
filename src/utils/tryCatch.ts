interface Success<T> {
  result: T
  exception?: never
}

interface Failure {
  result?: never
  exception: {getError: () => unknown}
}

type TryCatchResult<T> = Success<T> | Failure

export default async function tryCatch<T>(fn: (() => T) | Promise<T>): Promise<TryCatchResult<T>> {
  try {
    const result = typeof fn === 'function' ? fn() : await fn
    return {result}
  } catch (error) {
    return {exception: {getError: () => error}}
  }
}
