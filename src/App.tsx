// This is a workaround for unplugin-fonts
import 'unfonts.css'
import './App.scss'
import 'lazysizes'
import 'lazysizes/plugins/parent-fit/ls.parent-fit'
import 'lazysizes/plugins/attrchange/ls.attrchange'
import './setupSchema'
import './i18n/setup'

import {HeroUIProvider} from '@heroui/react'
import {Partytown} from '@qwik.dev/partytown/react'
import {announce} from '@react-aria/live-announcer'
import {addIntegration, tanstackRouterBrowserTracingIntegration} from '@sentry/react'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {RouterProvider} from '@tanstack/react-router'
// import {Inspector} from 'react-dev-inspector'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'

import ChainSwitchRequester from '@/lib/starknet/components/ChainSwitchRequester'
import ChainSwitchSubscriber from '@/lib/starknet/components/ChainSwitchSubscriber'
import {logError} from '@/utils/logger'

import UpdateMousePosition from './components/UpdateMousePosition'
import WolfyBackground from './components/WolfyBackground'
import WolfyToaster from './components/WolfyToaster'
import {DEBUG} from './constants/config'
import Head from './lib/head/Head'
import ThemeSubscriber from './lib/theme/ThemeSubscriber'
import ThemeUpdater from './lib/theme/ThemeUpdater'
import TokenPricesUpdater from './lib/trade/components/TokenPricesUpdater'
import {createQueryClient, createQueryPersistOptions} from './queries/queries'
import {createRouter} from './router'
import {setupWolfy, teardownWolfy} from './setupWolfy'
import {QueryErrorBoundary} from './utils/query/QueryErrorBoundary'
import ErrorComponent from './views/Error/ErrorComponent'

const JotaiDevTools = import.meta.env.PROD
  ? () => null
  : lazy(async () => import('./utils/components/JotaiDevTools'))

const PARTYTOWN_FORWARD = ['dataLayer.push']

function ErrorBoundaryFallbackRender({error}: ReadonlyDeep<FallbackProps>) {
  logError(error)

  const errorMessage = (() => {
    if (typeof error !== 'object') return undefined
    if (error === null) return undefined
    if (!('message' in error)) return undefined
    /* eslint-disable @typescript-eslint/no-unsafe-member-access -- it's guaranteed by the previous condition */
    if (typeof error.message !== 'string') return undefined

    return error.message as string
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  })()

  const errorCode = (() => {
    if (typeof error !== 'object') return undefined
    if (error === null) return undefined
    if (!('code' in error)) return undefined
    /* eslint-disable @typescript-eslint/no-unsafe-member-access -- it's guaranteed by the previous condition */
    if (typeof error.code !== 'string') return undefined

    return error.code as string
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  })()

  return <ErrorComponent errorMessage={errorMessage} errorCode={errorCode} />
}

function App() {
  // Ensures each request has its own cache in SSR
  const [queryClient] = useState(() => createQueryClient())
  const [persistOptions] = useState(() => createQueryPersistOptions())

  const [router] = useState(() => createRouter({queryClient}))

  addIntegration(tanstackRouterBrowserTracingIntegration(router))

  useEffect(() => {
    // Init the live announcer, fixes for https://github.com/adobe/react-spectrum/issues/5191
    announce(' ', 'polite', 0)
  }, [])

  useEffect(function setup() {
    setupWolfy()

    return () => {
      teardownWolfy()
    }
  }, [])

  return (
    <HeroUIProvider>
      <ErrorBoundary fallback={null}>
        <Partytown debug={DEBUG} forward={PARTYTOWN_FORWARD} />
      </ErrorBoundary>
      <ErrorBoundary fallbackRender={ErrorBoundaryFallbackRender}>
        <WolfyBackground />
        {/* <Inspector /> */}
        <Suspense>
          <JotaiDevTools />
        </Suspense>
        <Head />
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <QueryErrorBoundary>
            <UpdateMousePosition />
            <WolfyToaster />
            <ThemeUpdater />
            <ThemeSubscriber />
            <ChainSwitchRequester />
            <ChainSwitchSubscriber />
            <TokenPricesUpdater />
            <RouterProvider router={router} />
          </QueryErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </HeroUIProvider>
  )
}

export default App
