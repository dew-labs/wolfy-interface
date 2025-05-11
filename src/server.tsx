/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import * as Sentry from '@sentry/react'
import {getRouterManifest} from '@tanstack/react-start/router-manifest'
import {createStartHandler, defaultStreamHandler} from '@tanstack/react-start/server'
import {createStore} from 'jotai'

import {createQueryClient} from './queries/queries'
import {createRouter} from './router'

// Define a stream handler based on Sentry availability
let streamHandler = defaultStreamHandler

// Only wrap with Sentry if DSN is available
if (process.env.VITE_SENTRY_DSN) {
  const originalHandler = defaultStreamHandler

  streamHandler = async options => {
    try {
      return await originalHandler(options)
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  }
}

function createMyRouter() {
  const queryClient = createQueryClient()
  const store = createStore()
  return createRouter({queryClient, store})
}

export default createStartHandler({
  createRouter: createMyRouter,
  getRouterManifest,
})(streamHandler)
/* eslint-enable @eslint-react/naming-convention/filename */
