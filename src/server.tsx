/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import '@/setup'

import * as Sentry from '@sentry/react'
import {createStartHandler, defaultStreamHandler} from '@tanstack/react-start/server'
import {InferSeoMetaPlugin} from '@unhead/addons'
import {AliasSortingPlugin, CanonicalPlugin} from '@unhead/react/plugins'
import {createHead, UnheadProvider} from '@unhead/react/server'
import {createStore} from 'jotai'

import {createQueryClient} from './query'
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

function createRouterWithContext() {
  const queryClient = createQueryClient()
  const store = createStore()
  const head = createHead({
    plugins: [
      AliasSortingPlugin,
      CanonicalPlugin({
        canonicalHost: 'https://mysite.com',
      }),
      InferSeoMetaPlugin(),
    ],
  })

  return createRouter({
    queryClient,
    store,
    head,
    Wrap: ({children}) => {
      return <UnheadProvider value={head}>{children}</UnheadProvider>
    },
  })
}

export default createStartHandler({
  createRouter: createRouterWithContext,
})(streamHandler)
/* eslint-enable @eslint-react/naming-convention/filename */
