export default memo(function UpdateMousePosition() {
  useLayoutEffect(() => {
    const root = document.documentElement

    const abortController = new AbortController()

    root.addEventListener(
      'mousemove',
      (e: MouseEvent) => {
        root.style.setProperty('--mouse-x', `${e.clientX}px`)
        root.style.setProperty('--mouse-y', `${e.clientY}px`)
      },
      {signal: abortController.signal},
    )

    return () => {
      abortController.abort()
    }
  }, [])

  return null
})
