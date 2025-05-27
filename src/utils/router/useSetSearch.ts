import {type RegisteredRouter} from '@tanstack/react-router'
import type {
  ConstrainLiteral,
  MakeRouteMatch,
  NavigateOptions,
  RouteIds,
} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

export default function useSetSearch<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  RouteFullPath extends MakeRouteMatch<RegisteredRouter['routeTree'], RouteId>['fullPath'],
  SearchParamSetter extends Extract<
    NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['search'],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- intentional
    Function
  >,
  // @ts-expect-error -- complex typescript
  SearchParamKey extends keyof ReturnType<SearchParamSetter>,
  // @ts-expect-error -- complex typescript
  SearchParamValueOut extends ReturnType<SearchParamSetter>[SearchParamKey],
>(currentRoute: RouteId, name: SearchParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)
  const {fullPath} = useMatch({from: currentRoute})
  const latestFullPatch = useLatest(fullPath)

  return useCallback(
    async (
      value:
        | SearchParamValueOut
        // @ts-expect-error -- complex typescript
        | ((prevValue: Parameters<SearchParamSetter>[0][SearchParamKey]) => SearchParamValueOut),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- complex typescript
      return navigate({
        to: latestFullPatch.current,
        search: prevSearch => ({
          ...prevSearch,
          // @ts-expect-error -- complex typescript
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- complex typescript
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
// const route = '/flights/' satisfies RouteId
// type RouteFullPath = MakeRouteMatch<RegisteredRouter['routeTree'], typeof route>['fullPath']
// type SearchParamSetter = Extract<
//   // ^?
//   NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['search'],
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- intentional
//   Function
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
