import {stringify} from 'devalue'

export default function errorMessageOrUndefined(error: unknown): string | undefined {
  try {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      if (typeof error.message === 'string') {
        return error.message
      }
      return stringify(error.message)
    }
    return String(error)
  } catch {
    return undefined
  }
}
