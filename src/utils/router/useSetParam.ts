import {type RegisteredRouter} from '@tanstack/react-router'
import type {ConstrainLiteral, MakeRouteMatch, RouteIds} from '@tanstack/router-core'
import type {
  NavigateOptionProps,
  NavigateOptions,
} from 'node_modules/@tanstack/router-core/dist/esm/link'

import isFunction from '@/utils/types/guards/isFunction'

export default function useSetParam<
  RouteId extends ConstrainLiteral<string, RouteIds<RegisteredRouter['routeTree']>>,
  RouteFullPath extends MakeRouteMatch<RegisteredRouter['routeTree'], RouteId>['fullPath'],
  ParamSetter extends Extract<
    NavigateOptions<RegisteredRouter, RouteFullPath, RouteFullPath>['params'],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- intentional
    Function
  >,
  // @ts-expect-error -- complex typescript
  ParamKey extends keyof ReturnType<ParamSetter>,
  // @ts-expect-error -- complex typescript
  ParamValueOut extends ReturnType<ParamSetter>[ParamKey],
>(currentRoute: RouteId, name: ParamKey, defaultOptions?: NavigateOptionProps) {
  const navigate = useNavigate()
  const latestDefaultOptions = useLatest(defaultOptions)
  const {fullPath} = useMatch({from: currentRoute})
  const latestFullPatch = useLatest(fullPath)

  return useCallback(
    async (
      value:
        | ParamValueOut
        // @ts-expect-error -- complex typescript
        | ((prevValue: Parameters<ParamSetter>[0][ParamKey]) => ParamValueOut),
      options?: NavigateOptionProps,
    ) => {
      // @ts-expect-error -- complex typescript
      return navigate({
        to: latestFullPatch.current,
        search: prevSearch => prevSearch,
        params: prevParams => ({
          ...prevParams,
          // @ts-expect-error -- complex typescript
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- complex typescript
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
