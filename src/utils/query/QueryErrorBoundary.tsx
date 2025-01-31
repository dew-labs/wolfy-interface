import {QueryErrorResetBoundary} from '@tanstack/react-query'
import {ErrorBoundary} from 'react-error-boundary'

import QueryErrorComponent from '@/views/Error/QueryErrorComponent'

export function QueryErrorBoundary({children}: PropsWithChildren) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary onReset={reset} fallbackRender={QueryErrorComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
