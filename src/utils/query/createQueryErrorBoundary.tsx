import {ErrorBoundary, type ErrorBoundaryProps} from '@sentry/react'

interface Props {
  // Must be user-readable error code
  errorCode?: string | undefined
  // Must be user-readable error message (description)
  errorMessage?: string | undefined
  reset?: () => void
}

export default function createQueryErrorBoundary(ErrorComponent: ElementType<Props>) {
  const QueryErrorBoundary = deepMemo<
    PropsWithChildren<Props & Omit<ErrorBoundaryProps, 'children | fallback | onReset'>>
  >()()(function QueryErrorBoundary({children, errorCode, errorMessage, beforeCapture, ...props}) {
    return (
      <QueryErrorResetBoundary>
        {/* @ts-expect-error Don't know why typescript dont pick up the type */}
        {({reset}) => (
          // @ts-expect-error 3rd party error
          <ErrorBoundary
            {...props}
            // @ts-expect-error 3rd party error
            beforeCapture={(scope, error, componentStack) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- 3rd party error
              scope.setTag('error.type', 'query')
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- 3rd party error
              beforeCapture?.(scope, error, componentStack)
            }}
            onReset={reset}
            // @ts-expect-error 3rd party error
            fallback={props => (
              <ErrorComponent
                errorCode={errorCode}
                errorMessage={errorMessage}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- 3rd party error
                reset={props.resetError}
              />
            )}
          >
            {children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    )
  })

  return QueryErrorBoundary
}
