import {QueryErrorResetBoundary} from '@tanstack/react-query'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'

interface QueryErrorBoundaryProps {
  FallbackComponent: ComponentType<FallbackProps>
}

export default deepMemo(function QueryErrorBoundary({
  children,
  FallbackComponent,
}: Readonly<PropsWithChildren<QueryErrorBoundaryProps>>) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
})
