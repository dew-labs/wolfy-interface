import type {ErrorMetadata} from '@/utils/logger'

import MaybePermanentError, {isPermanentError} from './MaybePermanentError'

export default class ErrorWithMetadata extends MaybePermanentError {
  constructor(
    type: `${string}Error`,
    name: string,
    message?: string,
    metadata?: ErrorMetadata,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = type + (name ? `(${name})` : '')
    this.isPermanent = isPermanentError(options?.cause)
  }
}
