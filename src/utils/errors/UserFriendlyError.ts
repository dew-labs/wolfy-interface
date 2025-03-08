import MaybePermanentError, {isPermanentError} from './MaybePermanentError'

/**
 * Rethrow the error, with a user-friendly message.
 * The error itself should not be logged, but instead the cause should be logged.
 */
export default class UserFriendlyError extends MaybePermanentError {
  static readonly isUserFriendly = true

  constructor(message: string, cause?: unknown) {
    super(message, {cause})
    this.name = 'UserFriendlyError'
    this.isPermanent = isPermanentError(cause)
  }
}

export function isUserFriendlyError(err: unknown): err is UserFriendlyError {
  return err instanceof UserFriendlyError
}
