/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import '@/setup'

import * as Sentry from '@sentry/react'
import {StartClient} from '@tanstack/react-start/client'
import {InferSeoMetaPlugin} from '@unhead/addons'
import {createHead, UnheadProvider} from '@unhead/react/client'
import {AliasSortingPlugin, CanonicalPlugin} from '@unhead/react/plugins'
import {createStore} from 'jotai'
import {StrictMode} from 'react'
import {hydrateRoot} from 'react-dom/client'

import {createQueryClient} from './query'
import {createRouter} from './router'

const store = createStore()
const queryClient = createQueryClient()
const head = createHead({
  plugins: [
    AliasSortingPlugin,
    CanonicalPlugin({
      canonicalHost: 'https://mysite.com',
    }),
    InferSeoMetaPlugin(),
  ],
})
const router = createRouter({
  queryClient,
  store,
  head,
  Wrap: ({children}) => {
    return <UnheadProvider head={head}>{children}</UnheadProvider>
  },
})

// Check if Sentry DSN is defined before creating error boundary
const AppComponent = process.env.VITE_SENTRY_DSN
  ? Sentry.withErrorBoundary(StartClient, {
      fallback: () => <div>An error has occurred. Our team has been notified.</div>,
    })
  : StartClient

hydrateRoot(
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope -- its guaranteed to be there, client only
  document,
  <StrictMode>
    <UnheadProvider head={head}>
      <AppComponent router={router} />
    </UnheadProvider>
  </StrictMode>,
)
/* eslint-enable @eslint-react/naming-convention/filename */
