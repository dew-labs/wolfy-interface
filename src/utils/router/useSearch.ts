import {type RegisteredRouter, useSearch as useBaseSearch} from '@tanstack/react-router'
import type {ConstrainLiteral, ResolveUseSearch, RouteIds} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetSearch from './useSetSearch'

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
