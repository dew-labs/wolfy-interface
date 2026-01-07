export default function useGetAtom<T>(atom: Atom<T>) {
  const store = useStore()
  return useCallback(() => store.get(atom), [atom, store])
}
