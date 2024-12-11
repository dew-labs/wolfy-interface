import {memo, useEffect} from 'react'

export default memo(function UpdateMousePosition() {
  useEffect(() => {
    const root = document.documentElement

    const eventListener = (e: MouseEvent) => {
      root.style.setProperty('--mouse-x', `${e.clientX}px`)
      root.style.setProperty('--mouse-y', `${e.clientY}px`)
    }

    root.addEventListener('mousemove', eventListener)

    return () => {
      root.removeEventListener('mousemove', eventListener)
    }
  }, [])
  return null
})
