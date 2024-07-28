import {toast} from 'sonner'

export default function toastErrorMessage(error: unknown, message?: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    toast.error(error.message)
  } else if (message) {
    toast.error(message)
  }
}
