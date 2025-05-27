import {type RegisteredRouter, useParams as useBaseParams} from '@tanstack/react-router'
import type {ConstrainLiteral, ResolveUseParams, RouteIds} from '@tanstack/router-core'
import type {NavigateOptionProps} from 'node_modules/@tanstack/router-core/dist/esm/link'

import useSetParam from './useSetParam'

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
