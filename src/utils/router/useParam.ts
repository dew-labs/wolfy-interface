import {type RegisteredRouter, useParams as useBaseParams} from '@tanstack/react-router'
import type {ResolveUseParams} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetParam from './useSetParam'

export default function useParam<
  CurrentRoute extends string,
  ParamOut extends ResolveUseParams<RegisteredRouter, CurrentRoute, true>,
  ParamKey extends keyof ParamOut,
>(currentRoute: CurrentRoute, name: ParamKey, defaultOptions?: NavigateOptionProps) {
  const {[name]: value} = useBaseParams({
    // @ts-expect-error -- complex typescript
    from: currentRoute,
  })

  return [
    value as ParamOut[ParamKey],
    // @ts-expect-error -- complex typescript
    useSetParam(currentRoute, name, defaultOptions),
  ] as const
}
