import {isPermanentError} from '@/utils/errors/MaybePermanentError'
import UserFriendlyError from '@/utils/errors/UserFriendlyError'

export default class UnexpectedError extends UserFriendlyError {
  constructor(cause?: unknown) {
    super('Something went wrong, please try again later!', cause)
    this.isPermanent = isPermanentError(cause)
  }
}
