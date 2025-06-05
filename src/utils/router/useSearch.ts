import {type RegisteredRouter, useSearch as useBaseSearch} from '@tanstack/react-router'
import type {ConstrainLiteral, ResolveUseSearch, RouteIds} from '@tanstack/router-core'
// eslint-disable-next-line sonarjs/no-internal-api-use -- i have to
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetSearch from './useSetSearch'

/**
 * A React hook that let you use a tanstack router's search param as a useState hook.
 *
 * @example
 * ```tsx
 * const [keyword, setKeyword] = useSearch(Route.id, 'keyword')
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
 * })
 * ```
 *
 * @param routeId - The route ID to use
 * @param name - The name of the search param to use
 * @param defaultOptions - The default navigate options to use
 * @returns The value of the search param and a search param async setter.
 */
export default function useSearch<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  SearchParamOut extends ResolveUseSearch<RegisteredRouter, RouteId, true>,
  SearchParamKey extends keyof SearchParamOut,
>(routeId: RouteId, name: SearchParamKey, defaultOptions?: NavigateOptionProps) {
  const {[name]: value} = useBaseSearch({
    from: routeId,
  })

  return [
    value as SearchParamOut[SearchParamKey],
    useSetSearch(routeId, name, defaultOptions),
  ] as const
}
