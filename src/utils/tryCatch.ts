export type Success<T> = [T, undefined]

export type Failure = [undefined, Error]

export type TryCatchResult<T> = Success<T> | Failure

function toError(maybeErr: unknown) {
  return maybeErr instanceof Error ? maybeErr : new Error('Unexpected error', {cause: maybeErr})
}

export default function tryCatch<T>(
  mayThrow: Promise<T> | (() => Promise<T>),
): Promise<TryCatchResult<T>>
export default function tryCatch<T>(mayThrow: () => T): TryCatchResult<T>
export default function tryCatch<T>(
  mayThrow: Promise<T> | (() => Promise<T> | T),
): Promise<TryCatchResult<T>> | TryCatchResult<T> {
  try {
    const outcome = mayThrow instanceof Promise ? mayThrow : mayThrow()

    if (!(outcome instanceof Promise)) return [outcome, undefined]

    return new Promise<TryCatchResult<T>>(resolve => {
      outcome
        .then(result => {
          resolve([result, undefined])
        })
        .catch(error => {
          resolve([undefined, toError(error)])
        })
    })
  } catch (error) {
    return [undefined, toError(error)]
  }
}
