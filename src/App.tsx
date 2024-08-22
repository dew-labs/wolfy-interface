import './App.scss'
import 'lazysizes'
import 'lazysizes/plugins/parent-fit/ls.parent-fit'
import 'lazysizes/plugins/attrchange/ls.attrchange'
import './setupSchema'
import './i18n/setup'
import './setupSatoru'

import {Partytown} from '@builder.io/partytown/react'
import {NextUIProvider} from '@nextui-org/react'
import {announce} from '@react-aria/live-announcer'
import {addIntegration, tanstackRouterBrowserTracingIntegration} from '@sentry/react'
import {QueryClientProvider, useQueryErrorResetBoundary} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {RouterProvider} from '@tanstack/react-router'
import {lazy, type PropsWithChildren, Suspense, useEffect, useState} from 'react'
// import {Inspector} from 'react-dev-inspector'
import {ErrorBoundary} from 'react-error-boundary'
import {Toaster} from 'sonner'

import ChainSwitchRequester from '@/lib/starknet/components/ChainSwitchRequester'
import ChainSwitchSubscriber from '@/lib/starknet/components/ChainSwitchSubscriber'
import {logError} from '@/utils/logger'
import QueryErrorComponent from '@/views/Error/QueryErrorComponent'

import AuthUpdater from './auth/AuthUpdater'
import GoogleOneTapLogin from './auth/components/GoogleOneTapLogin'
import {DEBUG} from './constants/config'
import Head from './lib/head/Head'
import ThemeSubscriber from './lib/theme/ThemeSubscriber'
import ThemeUpdater from './lib/theme/ThemeUpdater'
import TokenPricesUpdater from './lib/trade/components/TokenPricesUpdater'
import {createQueryClient} from './queries/queries'
import {createRouter} from './router'
import ErrorComponent from './views/Error/ErrorComponent'

const JotaiDevTools = import.meta.env.PROD
  ? () => null
  : lazy(async () => import('./utils/components/JotaiDevTools'))

function QueryErrorBoundary({children}: PropsWithChildren) {
  const {reset} = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary onReset={reset} fallbackRender={QueryErrorComponent}>
      {children}
    </ErrorBoundary>
  )
}

function App() {
  // Ensures each request has its own cache in SSR
  const [queryClient] = useState(() => createQueryClient())

  const [router] = useState(() => createRouter({queryClient}))

  addIntegration(tanstackRouterBrowserTracingIntegration(router))

  useEffect(() => {
    // Init the live announcer, fixes for https://github.com/adobe/react-spectrum/issues/5191
    announce(' ', 'polite', 0)
  }, [])

  return (
    <NextUIProvider>
      <ErrorBoundary fallback={null}>
        <Partytown debug={DEBUG} forward={['dataLayer.push']} />
      </ErrorBoundary>
      <ErrorBoundary
        fallbackRender={({error}) => {
          logError(error)
          return <ErrorComponent />
        }}
      >
        {/* <Inspector /> */}
        <Suspense>
          <JotaiDevTools />
        </Suspense>
        <Head />
        <QueryClientProvider client={queryClient}>
          <QueryErrorBoundary>
            <Toaster richColors />
            <ThemeUpdater />
            <ThemeSubscriber />
            <ChainSwitchRequester />
            <ChainSwitchSubscriber />
            <GoogleOneTapLogin router={router} />
            <AuthUpdater router={router} />
            <TokenPricesUpdater />
            <RouterProvider router={router} />
          </QueryErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </NextUIProvider>
  )
}

export default App
