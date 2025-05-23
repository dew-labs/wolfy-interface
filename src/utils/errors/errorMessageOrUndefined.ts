import {stringify} from 'devalue'

export default function errorMessageOrUndefined(error: unknown): string | undefined {
  try {
    // @ts-expect-error error can be anything
    if ('message' in error) {
      if (typeof error.message === 'string') {
        return error.message
      }
      return stringify(error.message)
    }
  } catch {
    return undefined
  }
}
