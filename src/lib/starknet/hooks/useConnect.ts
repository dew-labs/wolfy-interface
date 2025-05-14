export const isConnectModalOpenAtom = atom(false)

export default function useConnect() {
  const setIsConnectModalOpen = useSetAtom(isConnectModalOpenAtom)

  return useCallback(() => {
    setIsConnectModalOpen(true)
  }, [])
}
