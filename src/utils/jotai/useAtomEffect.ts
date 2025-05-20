import type {Atom} from 'jotai'

export function useAtomEffect<T>(atom: Atom<T>, dispatch: Dispatch<SetStateAction<T>>) {
  useAtom(
    useMemo(
      () =>
        atomEffect(get => {
          dispatch(get(atom))
        }),
      [atom, dispatch],
    ),
  )
}
