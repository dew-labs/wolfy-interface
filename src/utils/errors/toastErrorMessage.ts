import {announce} from '@react-aria/live-announcer'
import {toast} from 'sonner'

const DEFAULT_ERROR_MESSAGE = 'Something went wrong, please try again later.'

export default function toastErrorMessage(error?: unknown, message?: string) {
  let errorMessage = message ?? DEFAULT_ERROR_MESSAGE

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    errorMessage = error.message
  }

  if (typeof error === 'string') {
    errorMessage = error
  }

  toast.error(errorMessage)
  announce(errorMessage)
}
