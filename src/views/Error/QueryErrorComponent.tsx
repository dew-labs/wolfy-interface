import type {FallbackProps} from 'react-error-boundary'

import {logError} from '@/utils/logger'

import ErrorComponent from './ErrorComponent'

export default function QueryErrorComponent({error, resetErrorBoundary}: Readonly<FallbackProps>) {
  logError(error)

  return <ErrorComponent reset={resetErrorBoundary} />
}
