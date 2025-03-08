import {type ErrorComponentProps} from '@tanstack/react-router'

import {logError} from '@/utils/logger'

import ErrorComponent from './ErrorComponent'

export default memo(function RouterErrorComponent({
  error,
  info,
  reset,
}: Readonly<ErrorComponentProps>) {
  const router = useRouter()
  const {reset: resetQueryErrorBoundary} = useQueryErrorResetBoundary()

  logError(error, info)

  const onReset = useCallback(() => {
    // Reset the router error boundary
    reset()
    resetQueryErrorBoundary()
    // Invalidate the route to reload the loader
    void router.invalidate()
  }, [reset, resetQueryErrorBoundary, router])

  return <ErrorComponent reset={onReset} />
})
