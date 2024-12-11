import {useQueryErrorResetBoundary} from '@tanstack/react-query'
import {type ErrorComponentProps, useRouter} from '@tanstack/react-router'
import {memo, useCallback, useEffect} from 'react'

import {logError} from '@/utils/logger'

import ErrorComponent from './ErrorComponent'

export default memo(function RouterErrorComponent({error, info, reset}: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    // Reset the query error boundary
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  logError(error, info)

  const onReset = useCallback(() => {
    // Reset the router error boundary
    reset()
    // Invalidate the route to reload the loader
    void router.invalidate()
  }, [reset, router])

  return <ErrorComponent reset={onReset} />
})
