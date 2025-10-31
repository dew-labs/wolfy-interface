import {QueryErrorResetBoundary} from '@tanstack/react-query'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'

interface QueryErrorBoundaryProps {
  FallbackComponent: ComponentType<FallbackProps>
}

const QueryErrorBoundary = deepMemo<Readonly<PropsWithChildren<QueryErrorBoundaryProps>>>()()(
  function QueryErrorBoundary({children, FallbackComponent}) {
    return (
      <QueryErrorResetBoundary>
        {({reset}) => (
          <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
            {children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    )
  },
)
export default QueryErrorBoundary
