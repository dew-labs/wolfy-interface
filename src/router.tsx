/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import {dehydrate, hydrate, type QueryClient} from '@tanstack/react-query'
import {createRouter as createReactRouter, stringifySearchWith} from '@tanstack/react-router'
// import {parse as devalueParse, stringify as devalueStringify} from 'devalue'
import {type createStore} from 'jotai'

import {routeTree} from './routeTree.gen'
import RouterErrorComponent from './views/Error/RouterErrorComponent'
import NotFound from './views/NotFound/NotFound'

export interface RouterContext {
  queryClient: QueryClient
  store: ReturnType<typeof createStore>
}

// Tanstack's default parse behavior: just like JSON.parse, JSON.stringify => suport JSON types
// - Support deeply parse objects (nested objects)
// - Convert legit value to `number`, `boolean`, `null`, `object`, `array`
// - Everything else is `string`
// - `undefined` when parsing, meaning the key is not present in the search string; when stringifying, will be a string
// `query-string` (the most popular library for parsing and stringifying search params) different from the default behavior of `tanstack`:
// - Don't support nested objects,
// - Have the options to convert value to `number`, `boolean`, `array` (customize syntax); `null`, `object` is not supported and will be a string;
// - Can skip `null` and empty string when stringify;
// const BASE_SEARCH_OPTIONS: SharedUnionFieldsDeep<
//   queryString.ParseOptions | queryString.StringifyOptions
// > = {
//   arrayFormat: 'comma', // or none?
// }

// const PARSE_SEARCH_OPTIONS: queryString.ParseOptions = {
//   ...BASE_SEARCH_OPTIONS,
//   parseBooleans: true,
//   parseNumbers: true,
// }

// const STRINGIFY_SEARCH_OPTIONS: queryString.StringifyOptions = {
//   ...BASE_SEARCH_OPTIONS,
//   skipNull: true,
//   skipEmptyString: true,
// }

// const parseSearch = (search: string) => queryString.parse(search, PARSE_SEARCH_OPTIONS),
// const stringifySearch = (search: Record<string, unknown>) => queryString.stringify(search, STRINGIFY_SEARCH_OPTIONS),

export function createRouter({
  queryClient,
  store,
}: {
  queryClient: QueryClient
  store: ReturnType<typeof createStore>
}) {
  return createReactRouter({
    // serializer: {stringify: devalueStringify, parse: devalueParse}, // NOTE: temporary removed and will come back later https://github.com/TanStack/router/pull/3216
    // Thinking about using jsurl2 for better readability, or zipson for shorter string,
    // type-coverage:ignore-next-line
    stringifySearch: stringifySearchWith(value => {
      // Default tanstack router's stringifier will wrap string with double quotes, which is not what we want https://github.com/TanStack/router/blob/1c71ab16c052e7514152481c1115c8928d4eca74/packages/router-core/src/searchParams.ts#L34
      // type-coverage:ignore-next-line
      if (typeof value === 'object') {
        // type-coverage:ignore-next-line
        return JSON.stringify(value)
      }

      // type-coverage:ignore-next-line
      return String(value)
    }, JSON.parse),
    routeTree,
    context: {queryClient, store},
    // On the server, dehydrate the loader client and return it
    // to the router to get injected into `<DehydrateRouter />`
    dehydrate: () => ({queryClientState: dehydrate(queryClient)}),
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
    defaultViewTransition: {
      types: ['slow-fade'],
    },
  })
}

export type Router = ReturnType<typeof createRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: Router
  }
}
/* eslint-enable @eslint-react/naming-convention/filename */
