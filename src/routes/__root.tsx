import {HeroUIProvider} from '@heroui/react'
import {Partytown} from '@qwik.dev/partytown/react'
import type {Href} from '@react-types/shared'
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createRootRouteWithContext, HeadContent, Scripts} from '@tanstack/react-router'
import {UnheadProvider} from '@unhead/react/client'
import {Provider as JotaiProvider} from 'jotai'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import invariant from 'tiny-invariant'
import type {ReadonlyDeep} from 'type-fest'

// This is a workaround for unplugin-fonts
// import unfontsCss from 'unfonts.css?url'
import {DEBUG, DESCRIPTION, ENABLE_DEVTOOLS, TITLE} from '@/constants/config'
import Global from '@/Global'
import {createQueryPersistOptions} from '@/query'
import type {RouterContext} from '@/router'
import globalCss from '@/style/global.scss?url'
import tailwindCss from '@/style/tailwind.css?url'
import skipTargetProps from '@/utils/a11y/skipTargetProps'
import VisuallyHidden from '@/utils/a11y/VisuallyHidden'
import {logError} from '@/utils/logger'
import QueryErrorBoundary from '@/utils/query/QueryErrorBoundary'
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

function ErrorBoundaryFallback({error, resetErrorBoundary}: ReadonlyDeep<FallbackProps>) {
  logError(error)

  const errorMessage = (() => {
    if (typeof error !== 'object') return undefined
    if (error === null) return undefined
    if (!('message' in error)) return undefined
    /* eslint-disable @typescript-eslint/no-unsafe-member-access -- it's guaranteed by the previous condition */
    if (typeof error.message !== 'string') return undefined

    return String(error.message)
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  })()

  const errorCode = (() => {
    if (typeof error !== 'object') return undefined
    if (error === null) return undefined
    if (!('code' in error)) return undefined
    /* eslint-disable @typescript-eslint/no-unsafe-member-access -- it's guaranteed by the previous condition */
    if (typeof error.code !== 'string') return undefined

    return String(error.code)
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  })()

  return (
    <ErrorComponent errorMessage={errorMessage} errorCode={errorCode} reset={resetErrorBoundary} />
  )
}

const DevTool = deepMemo<PropsWithChildren>()()(function DevTool({children}) {
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
  const {store, queryClient, head} = useRouteContext({
    strict: false,
  })

  invariant(queryClient, 'queryClient is required')
  invariant(store, 'store is required')
  invariant(head, 'head is required')

  // eslint-disable-next-line @eslint-react/naming-convention/use-state -- not needed
  const [persistOptions] = useState(() => createQueryPersistOptions())

  const navigate = useCallback(async (to: string) => router.navigate({to}), [router])
  const useHref = useCallback((to: Href) => router.buildLocation({to}).href, [router])
  return (
    <RootDocument>
      <UnheadProvider head={head}>
        <ErrorBoundary fallback={null}>
          <Partytown debug={DEBUG} forward={PARTYTOWN_FORWARD} />
        </ErrorBoundary>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
          <JotaiProvider store={store}>
            <HeroUIProvider navigate={navigate} useHref={useHref}>
              <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
                <QueryErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                  <Global />
                  <VisuallyHidden strict {...skipTargetProps('top')} />
                  <HeadContent />
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
      </UnheadProvider>
    </RootDocument>
  )
})

function RootDocument({children}: Readonly<{children: ReactNode}>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const OG_IMAGE = '/og.jpg'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1.0, shrink-to-fit=no, interactive-widget=resizes-content, viewport-fit=cover, user-scalable=yes',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        title: TITLE,
      },
      {
        property: 'og:title',
        content: TITLE,
      },
      {
        property: 'twitter:title',
        content: TITLE,
      },
      {
        description: DESCRIPTION,
      },
      {
        property: 'og:description',
        content: DESCRIPTION,
      },
      {
        property: 'twitter:description',
        content: OG_IMAGE,
      },
      {
        property: 'og:image',
        content: OG_IMAGE,
      },
      {
        property: 'twitter:image',
        content: OG_IMAGE,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
      // {rel: 'stylesheet', href: unfontsCss},
      {rel: 'stylesheet', href: tailwindCss},
      {rel: 'stylesheet', href: globalCss},
    ],
    scripts: [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=<%- gtagTagId %>',
        async: true,
      },
      {
        children: `window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      gtag('config', '<%- gtagTagId %>')`,
      },
    ],
  }),
  component: RootRoute,
})
