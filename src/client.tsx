/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import * as Sentry from '@sentry/react'
import {StartClient} from '@tanstack/react-start'
import {createStore} from 'jotai'
import {hydrateRoot} from 'react-dom/client'

import {createQueryClient} from './queries/queries'
import {createRouter} from './router'

const store = createStore()
const queryClient = createQueryClient()
const router = createRouter({queryClient, store})

// Check if Sentry DSN is defined before creating error boundary
const AppComponent = process.env.VITE_SENTRY_DSN
  ? Sentry.withErrorBoundary(StartClient, {
      fallback: () => <div>An error has occurred. Our team has been notified.</div>,
    })
  : StartClient

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, ssr-friendly/no-dom-globals-in-module-scope -- its guaranteed to be there, client only
hydrateRoot(document.getElementById('root')!, <AppComponent router={router} />)
/* eslint-enable @eslint-react/naming-convention/filename */
