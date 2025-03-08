import '@/setup'

import {HeroUIProvider} from '@heroui/react'
import {Partytown} from '@qwik.dev/partytown/react'
import type { Href } from '@react-types/shared'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {
  createRootRouteWithContext,
  Outlet,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router'
import {Provider as JotaiProvider} from 'jotai'
import type {PropsWithChildren} from 'react'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import invariant from 'tiny-invariant'
import type {ReadonlyDeep} from 'type-fest'

import {DEBUG, ENABLE_DEVTOOLS} from '@/constants/config'
import Global from '@/Global'
import {createQueryPersistOptions} from '@/queries/queries'
import type {RouterContext} from '@/router'
import skipTargetProps from '@/utils/a11y/skipTargetProps'
import VisuallyHidden from '@/utils/a11y/VisuallyHidden'
import {logError} from '@/utils/logger'
import {QueryErrorBoundary} from '@/utils/query/QueryErrorBoundary'
import ErrorComponent from '@/views/Error/ErrorComponent'

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

const DevTool = memo(function DevTool({children}: PropsWithChildren) {
  if (!ENABLE_DEVTOOLS) return null

  return (
    <ErrorBoundary fallback={null}>
      <Suspense>{children}</Suspense>
    </ErrorBoundary>
  )
})

const PARTYTOWN_FORWARD = ['dataLayer.push']

const RootRoute = memo(function RootRoute() {
  const router = useRouter()
  const {store, queryClient} = useRouteContext({
    strict: false,
  })

  invariant(queryClient, 'queryClient is required')
  invariant(store, 'store is required')

  const [persistOptions] = useState(() => createQueryPersistOptions())

  const navigate = useCallback(async (to: string) => router.navigate({to}), [router])
  const useHref = useCallback((to: Href) => router.buildLocation({to}).href, [router])
  return (
    <>
      <ErrorBoundary fallback={null}>
        <Partytown debug={DEBUG} forward={PARTYTOWN_FORWARD} />
      </ErrorBoundary>
      <ErrorBoundary fallbackRender={ErrorBoundaryFallbackRender}>
        <JotaiProvider store={store}>
          <HeroUIProvider navigate={navigate} useHref={useHref}>
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
              <QueryErrorBoundary>
                <Global />
                <VisuallyHidden strict {...skipTargetProps('top')} />
                <Outlet />
                <DevTool>
                  <Inspector />
                </DevTool>
              </QueryErrorBoundary>
              <DevTool>
                <ReactQueryDevtools initialIsOpen={false} />
              </DevTool>
            </PersistQueryClientProvider>
          </HeroUIProvider>
          <DevTool>
            <JotaiDevTools />
          </DevTool>
        </JotaiProvider>
      </ErrorBoundary>
      <DevTool>
        <TanStackRouterDevtools initialIsOpen={false} />
      </DevTool>
    </>
  )
})

export const Route = createRootRouteWithContext<RouterContext>()({component: RootRoute})
