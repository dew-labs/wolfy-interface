import type {FallbackProps} from 'react-error-boundary'

import {logError} from '@/utils/logger'

import ErrorComponent from './ErrorComponent'

export default function QueryErrorComponent(props: FallbackProps) {
  logError(props.error)

  return <ErrorComponent reset={props.resetErrorBoundary} />
}
