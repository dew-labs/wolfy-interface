import {type RegisteredRouter} from '@tanstack/react-router'
import type {ResolveUseParams} from '@tanstack/router-core'
import type {
  NavigateOptionProps,
  PathParamOptions,
} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

export default function useSetParam<
  CurrentRoute extends string,
  SetParam extends Exclude<
    PathParamOptions<RegisteredRouter, CurrentRoute, CurrentRoute>['params'],
    undefined | true
  >,
  ParamOut extends ResolveUseParams<RegisteredRouter, CurrentRoute, true>,
  ParamKey extends keyof ParamOut,
  // @ts-expect-error -- complex typescript
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- its valid
  ParamValueIn extends Exclude<SetParam, Function>[ParamKey],
>(currentRoute: CurrentRoute, name: ParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)

  return useCallback(
    async (
      value: ParamValueIn | ((prevValue: ParamOut[ParamKey]) => ParamValueIn),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- complex typescript
      return navigate({
        to: currentRoute,
        search: prevSearch => prevSearch,
        params: prevParams => ({
          ...prevParams,
          // @ts-expect-error -- complex typescript
          [name]: isFunction(value) ? value(prevParams[[name]] as ParamValueIn) : value,
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
