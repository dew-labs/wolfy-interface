import {createRootRouteWithContext, Outlet, useRouter} from '@tanstack/react-router'
import {RouterProvider} from 'react-aria-components'

import type {RouterContext} from '@/router'
import RouteAnnouncer from '@/utils/router/RouteAnnouncer'

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(async () =>
      // Lazy load in development
      import('@tanstack/router-devtools').then(res => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    )

function RootRoute() {
  const router = useRouter()

  const navigate = useCallback(async (to: string) => router.navigate({to}), [router])

  return (
    <>
      <RouteAnnouncer />
      <RouterProvider navigate={navigate}>
        <Outlet />
        <Suspense>
          <TanStackRouterDevtools initialIsOpen={false} />
        </Suspense>
      </RouterProvider>
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
})
