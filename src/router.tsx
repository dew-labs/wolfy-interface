/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import {dehydrate, hydrate, type QueryClient} from '@tanstack/react-query'
import {createRouter as createReactRouter} from '@tanstack/react-router'
// import {parse as devalueParse, stringify as devalueStringify} from 'devalue'
import {type createStore} from 'jotai'

import {routeTree} from './routeTree.gen'
import RouterErrorComponent from './views/Error/RouterErrorComponent'
import NotFound from './views/NotFound/NotFound'

export interface RouterContext {
  queryClient: QueryClient
  store: ReturnType<typeof createStore>
}

export function createRouter({
  queryClient,
  store,
}: {
  queryClient: QueryClient
  store: ReturnType<typeof createStore>
}) {
  return createReactRouter({
    // transformer: {stringify, parse}, // NOTE: new encode/decode prop introduced but no proper docs https://github.com/TanStack/router/pull/3037 https://tanstack.com/router/latest/docs/framework/react/guide/ssr https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType#transformer-property
    routeTree,
    context: {queryClient, store},
    // On the server, dehydrate the loader client and return it
    // to the router to get injected into `<DehydrateRouter />`
    dehydrate: () => ({queryClientState: dehydrate(queryClient)}) as Record<string, unknown>, // TODO: investigate type error
    // On the client, hydrate the loader client with the data
    // we dehydrated on the server
    hydrate: dehydrated => {
      hydrate(queryClient, dehydrated.queryClientState)
    },
    defaultPreload: 'intent',
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0, // leverage cache control of react-query instead: we don't want loader calls to ever be stale as this will ensure that the loader is always called when the route is preloaded or visited
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouterErrorComponent,
    defaultStructuralSharing: true,
    scrollRestoration: true,
    // defaultPendingComponent
  })
}

export type Router = ReturnType<typeof createRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: Router
  }
}
/* eslint-enable @eslint-react/naming-convention/filename */
