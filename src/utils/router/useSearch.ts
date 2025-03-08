import {type RegisteredRouter, useSearch as useBaseSearch} from '@tanstack/react-router'
import type {ResolveUseSearch} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetSearch from './useSetSearch'

export default function useSearch<
  CurrentRoute extends string,
  SearchParamOut extends ResolveUseSearch<RegisteredRouter, CurrentRoute, true>,
  SearchParamKey extends keyof SearchParamOut,
>(currentRoute: CurrentRoute, name: SearchParamKey, defaultOptions?: NavigateOptionProps) {
  const {[name]: value} = useBaseSearch({
    // @ts-expect-error -- complex typescript
    from: currentRoute,
  })

  return [
    value as SearchParamOut[SearchParamKey],
    // @ts-expect-error -- complex typescript
    useSetSearch(currentRoute, name, defaultOptions),
  ] as const
}
