import {type RegisteredRouter, useParams as useBaseParams} from '@tanstack/react-router'
import type {ConstrainLiteral, ResolveUseParams, RouteIds} from '@tanstack/router-core'
// eslint-disable-next-line sonarjs/no-internal-api-use -- i have to
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetParam from './useSetParam'

/**
 * A React hook that let you use a tanstack router's path param as a useState hook.
 *
 * @example
 * ```tsx
 * const [page, setPage] = useParam(Route.id, 'page')
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
 * @returns The value of the path param and a path param async setter.
 */
export default function useParam<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  ParamOut extends ResolveUseParams<RegisteredRouter, RouteId, true>,
  ParamKey extends keyof ParamOut,
>(routeId: RouteId, name: ParamKey, defaultOptions?: NavigateOptionProps) {
  const {[name]: value} = useBaseParams({
    from: routeId,
  })

  return [value as ParamOut[ParamKey], useSetParam(routeId, name, defaultOptions)] as const
}
