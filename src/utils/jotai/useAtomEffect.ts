import type {Atom, Getter, Setter} from 'jotai'

export function useAtomEffect<T>(
  atom: Atom<T>,
  dispatch: (value: T, get?: Getter, set?: Setter) => void,
) {
  useAtom(
    useMemo(
      () =>
        atomEffect((get, set) => {
          dispatch(get(atom), get, set)
        }),
      [atom, dispatch],
    ),
  )
}
