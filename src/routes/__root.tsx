import {HeroUIProvider} from '@heroui/react'
import {Partytown} from '@qwik.dev/partytown/react'
import {ErrorBoundary} from '@sentry/react'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createRootRouteWithContext, HeadContent} from '@tanstack/react-router'
import {UnheadProvider} from '@unhead/react/client'
import {Provider as JotaiProvider} from 'jotai'
import invariant from 'tiny-invariant'

import {DEBUG, ENABLE_DEVTOOLS} from '@/constants/config'
import Global from '@/Global'
import {createQueryPersistOptions} from '@/query'
import type {RouterContext} from '@/router'
import skipTargetProps from '@/utils/a11y/skipTargetProps'
import VisuallyHidden from '@/utils/a11y/VisuallyHidden'
import ErrorPage from '@/views/Error/ErrorPage'

const JotaiDevTools = ENABLE_DEVTOOLS
  ? lazy(async () => import('@/utils/components/JotaiDevTools'))
  : () => null

const Inspector = ENABLE_DEVTOOLS
  ? lazy(async () => import('react-dev-inspector').then(res => ({default: res.Inspector})))
  : () => null

const ReactQueryDevtools = ENABLE_DEVTOOLS
  ? lazy(async () =>
      import('@tanstack/react-query-devtools').then(res => ({default: res.ReactQueryDevtools})),
    )
  : () => null

const TanStackRouterDevtools = ENABLE_DEVTOOLS
  ? lazy(async () =>
      import('@tanstack/router-devtools').then(res => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    )
  : () => null

const QueryGlobalErrorBoundary = deepMemo<PropsWithChildren>()()(function QueryErrorBoundary({
  children,
}) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary
          onReset={reset}
          beforeCapture={scope => {
            scope.setTag('error.type', 'query')
            scope.setTag('section', 'global')
          }}
          fallback={props => (
            <ErrorPage

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

const GlobalErrorBoundary = deepMemo<PropsWithChildren>()()(function GlobalErrorBoundary({
  children,
}) {
  return (
    <ErrorBoundary
      beforeCapture={scope => {
        scope.setTag('section', 'global')
      }}
      fallback={props => (
        <ErrorPage

          reset={props.resetError}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
})

const DevTool = deepMemo<PropsWithChildren>()()(function DevTool({children}) {
  if (!ENABLE_DEVTOOLS) return null

  return (
    <ErrorBoundary fallback={undefined}>
      <Suspense>{children}</Suspense>
    </ErrorBoundary>
  )
})

const PARTYTOWN_FORWARD = ['dataLayer.push']

const RootRoute = memo(function RootRoute() {
  const router = useRouter()
  const {store, queryClient, head} = useRouteContext({
    strict: false,
  })

  invariant(queryClient, 'queryClient is required')
  invariant(store, 'store is required')
  invariant(head, 'head is required')

  const [persistOptions] = useState(() => createQueryPersistOptions())

  const navigate = useCallback(async (to: string) => router.navigate({to}), [router])
  const useHref = useCallback((to: string) => router.buildLocation({to}).href, [router])

  return (
    <GlobalErrorBoundary>
      <UnheadProvider value={head}>
        <ErrorBoundary fallback={undefined}>
          <Partytown debug={DEBUG} forward={PARTYTOWN_FORWARD} />
        </ErrorBoundary>
        <JotaiProvider store={store}>
          <HeroUIProvider navigate={navigate} useHref={useHref}>
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
              <QueryGlobalErrorBoundary>
                <Global />
                <VisuallyHidden strict {...skipTargetProps('top')} />
                <HeadContent />
                <Outlet />
                <DevTool>
                  <Inspector />
                </DevTool>
              </QueryGlobalErrorBoundary>
              <DevTool>
                <ReactQueryDevtools initialIsOpen={false} />
              </DevTool>
            </PersistQueryClientProvider>
          </HeroUIProvider>
          <DevTool>
            <JotaiDevTools />
          </DevTool>
        </JotaiProvider>
        <DevTool>
          <TanStackRouterDevtools initialIsOpen={false} />
        </DevTool>
      </UnheadProvider>
    </GlobalErrorBoundary>
  )
})

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
})
