import {type RegisteredRouter} from '@tanstack/react-router'
import type {ConstrainLiteral, MakeRouteMatch, RouteIds} from '@tanstack/router-core'
// eslint-disable-next-line sonarjs/no-internal-api-use -- i have to
import type {
  NavigateOptionProps,
  NavigateOptions,
} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

/**
 * A React hook that let you update a tanstack router's path param via a setter.
 *
 * @example
 * ```tsx
 * const setPage = useSetParam(Route.id, 'page')
 *
 * setPage(1)
 * await setPage(prev => prev + 1, {
 *   replace: false,
 *   resetScroll: true,
 *   hashScrollIntoView: {
 *     behavior: 'smooth',
 *     block: 'start',
 *     inline: 'nearest',
 *   },
 * })
 * ```
 *
 * @param routeId - The route ID to use
 * @param name - The name of the path param to use
 * @param defaultOptions - The default navigate options to use
 * @returns The path param async setter.
 */
export default function useSetParam<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  RouteFullPath extends MakeRouteMatch<RegisteredRouter['routeTree'], RouteId>['fullPath'],
  ParamSetter extends Extract<
    NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['params'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- match library type
    (...args: any) => any
  >,
  ParamKey extends keyof ReturnType<ParamSetter>,
  ParamValueOut extends ReturnType<ParamSetter>[ParamKey],
>(routeId: RouteId, name: ParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)
  const {fullPath} = useMatch({from: routeId})
  const latestFullPatch = useLatest(fullPath)

  return useCallback(
    async (
      value:
        | ParamValueOut
        | ((prevValue: Parameters<ParamSetter>[0][ParamKey]) => ParamValueOut),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
      return navigate({
        to: latestFullPatch.current,
        search: prevSearch => prevSearch,
        params: prevParams => ({
          ...prevParams,
          // @ts-expect-error -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- navigate type gone wrong because the typeof fullPath cannot determine at compile time
          [name]: isFunction(value) ? value(prevParams[name] as ParamValueIn) : value,
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
