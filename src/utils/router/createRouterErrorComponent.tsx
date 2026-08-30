import {type ErrorComponentProps} from '@tanstack/react-router'

import {logError} from '@/utils/logger'

interface Props {
  // Must be user-readable error code
  errorCode?: string | undefined
  // Must be user-readable error message (description)
  errorMessage?: string | undefined
  reset?: () => void
}

export default function createRouterErrorComponent(ErrorComponent: ElementType<Props>) {
  // eslint-disable-next-line @eslint-react/component-hook-factories -- it's safe
  const RouterErrorComponent = memo<ErrorComponentProps>(function RouterErrorComponent({
    error,
    info,
    reset,
  }) {
    const router = useRouter()
    const queryErrorResetBoundary = useQueryErrorResetBoundary()

    logError(error, info as Record<'componentStack', string>)

    const onReset = useCallback(() => {
      // Reset the router error boundary
      reset()
      queryErrorResetBoundary.reset()
      // Invalidate the route to reload the loader
      void router.invalidate()
    }, [reset, queryErrorResetBoundary, router])

    return (
      <ErrorComponent
        reset={onReset}
      />
    )
  })

  return RouterErrorComponent
}
