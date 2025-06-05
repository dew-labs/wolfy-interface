import {type RegisteredRouter} from '@tanstack/react-router'
import type {
  ConstrainLiteral,
  MakeRouteMatch,
  NavigateOptions,
  RouteIds,
} from '@tanstack/router-core'
// eslint-disable-next-line sonarjs/no-internal-api-use -- i have to
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

/**
 * A React hook that let you update a tanstack router's search param via a setter.
 *
 * @example
 * ```tsx
 * const setKeyword = useSetSearch(Route.id, 'keyword')
 *
 * setKeyword('hello')
 * await setKeyword(prev => prev + ' world', {
 *   replace: false,
 *   resetScroll: true,
 *   hashScrollIntoView: {
 *     behavior: 'smooth',
 *     block: 'start',
 *     inline: 'nearest',
 *   },
 * }))
 * ```
 *
 * @param routeId - The route ID to use
 * @param name - The name of the search param to use
 * @param defaultOptions - The default navigate options to use
 * @returns The search param async setter.
 */
export default function useSetSearch<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  RouteFullPath extends MakeRouteMatch<RegisteredRouter['routeTree'], RouteId>['fullPath'],
  SearchParamSetter extends Extract<
    NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['search'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- match library type
    (...args: any) => any
  >,
  SearchParamKey extends keyof ReturnType<SearchParamSetter>,
  SearchParamValueOut extends ReturnType<SearchParamSetter>[SearchParamKey],
>(routeId: RouteId, name: SearchParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)
  const {fullPath} = useMatch({from: routeId})
  const latestFullPatch = useLatest(fullPath)

  return useCallback(
    async (
      value:
        | SearchParamValueOut
        | ((prevValue: Parameters<SearchParamSetter>[0][SearchParamKey]) => SearchParamValueOut),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
      return navigate({
        to: latestFullPatch.current,
        search: prevSearch => ({
          ...prevSearch,
          // @ts-expect-error -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
          [name]: isFunction(value) ? value(prevSearch[name]) : value,
        }),
        replace: true,
        resetScroll: false,
        ...latestDefaultOptions.current,
        ...options,
      })
    },
    [navigate, name],
  )
}

// type RouteId = ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>
// const route = '/_flight/flights/' satisfies RouteId
// type RouteFullPath = MakeRouteMatch<RegisteredRouter['routeTree'], typeof route>['fullPath']
// type SearchParamSetter = Extract<
//   // ^?
//   NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['search'],
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- match library type
//   (...args: any) => any
//   // Function
// >
// type SearchParamKey = keyof ReturnType<SearchParamSetter>
// const key = 'class' satisfies SearchParamKey
// //   ^?
// type _SearchParamValueIn = Parameters<SearchParamSetter>[0][typeof key]
// //   ^?
// type _SearchParamValueOut = ReturnType<SearchParamSetter>[typeof key]
// //   ^?

// // eslint-disable-next-line react-hooks/rules-of-hooks -- test
// const navigate = useNavigate()
// void navigate({
//   to: '' as RouteFullPath,
//   search: prev => {
//     //    ^?
//     return prev
//   },
// })

// // eslint-disable-next-line react-hooks/rules-of-hooks -- test
// const setKey = useSetSearch(route, key)
// void setKey(undefined)
// void setKey(prevKey => {
//   return prevKey
// })
