import {memo, useLayoutEffect} from 'react'

import getPreferColorScheme from './getPreferColorScheme'
import {Theme} from './theme'
import {useHydrateCurrentTheme, useSetCurrentTheme} from './useCurrentTheme'
import useTheme from './useTheme'

export default memo(function ThemeUpdater() {
  useHydrateCurrentTheme()

  const [theme] = useTheme()

  const setCurrentTheme = useSetCurrentTheme()

  useLayoutEffect(() => {
    if (theme !== Theme.System) {
      setCurrentTheme(theme)
      return
    }

    setCurrentTheme(getPreferColorScheme())

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- can run in environments without window.matchMedia
    if (!window.matchMedia) {
      return
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)')

    const mediaQueryListener: (evt: MediaQueryListEvent) => void = event => {
      setCurrentTheme(event.matches ? Theme.Dark : Theme.Light)
    }

    query.addEventListener('change', mediaQueryListener)
    return () => {
      query.removeEventListener('change', mediaQueryListener)
    }
  }, [theme])

  return null
})
