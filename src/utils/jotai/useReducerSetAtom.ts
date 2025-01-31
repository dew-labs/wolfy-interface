import type {PrimitiveAtom} from 'jotai'

export function useReducerSetAtom<Value, Action>(
  anAtom: PrimitiveAtom<Value>,
  reducer: (v: Value, a: Action) => Value,
) {
  const setState = useSetAtom(anAtom)
  const dispatch = useCallback(
    (action: Action) => {
      setState(prev => reducer(prev, action))
    },
    [setState, reducer],
  )
  return dispatch
}
