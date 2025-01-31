export function useResetComponent() {
  const [resetState, setResetController] = useState(0)

  const reset = useCallback(() => {
    setResetController(resetState => resetState + 1)
  }, [])

  return [resetState, reset] as const
}
