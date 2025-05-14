import {type RegisteredRouter} from '@tanstack/react-router'
import type {ResolveUseSearch, SearchParamOptions} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

export default function useSetSearch<
  CurrentRoute extends string,
  SetSearch extends Exclude<
    SearchParamOptions<RegisteredRouter, CurrentRoute, CurrentRoute>['search'],
    undefined | true
  >,
  SearchParamOut extends ResolveUseSearch<RegisteredRouter, CurrentRoute, true>,
  SearchParamKey extends keyof SearchParamOut,
  // @ts-expect-error -- complex typescript
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- its valid
  SearchParamValueIn extends Exclude<SetSearch, Function>[SearchParamKey],
>(currentRoute: CurrentRoute, name: SearchParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)

  return useCallback(
    async (
      value:
        | SearchParamValueIn
        | ((prevValue: SearchParamOut[SearchParamKey]) => SearchParamValueIn),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- complex typescript
      return navigate({
        to: currentRoute,
        search: prevSearch => ({
          ...prevSearch,
          // @ts-expect-error -- complex typescript
          [name]: isFunction(value) ? value(prevSearch[[name]] as SearchParamValueIn) : value,
        }),
        replace: true,
        resetScroll: false,
        ...latestDefaultOptions.current,
        ...options,
      })
    },
    [navigate, currentRoute, name],
  )
}
