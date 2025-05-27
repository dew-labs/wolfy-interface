import {ErrorBoundary} from 'react-error-boundary'

import QueryErrorComponent from '@/views/Error/QueryErrorComponent'

export default deepMemo(function QueryErrorBoundary({children}: Readonly<PropsWithChildren>) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary onReset={reset} fallbackRender={QueryErrorComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
})
