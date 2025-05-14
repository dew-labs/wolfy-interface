import {logError} from '@/utils/logger'

import getPreferColorScheme from './getPreferColorScheme'
import {Theme, themeAtom} from './theme'
import {currentThemeAtom} from './useCurrentTheme'

export const themeEffect = atomEffect((get, set) => {
  const theme = get(themeAtom)
  if (theme !== Theme.System) {
    set(currentThemeAtom, theme)
    return
  }

  set(currentThemeAtom, getPreferColorScheme())

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- can run in environments without window.matchMedia
  if (!window || !window.matchMedia) {
    return
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)')

  const abortController = new AbortController()

  query.addEventListener(
    'change',
    event => {
      set(currentThemeAtom, event.matches ? Theme.Dark : Theme.Light)
    },
    {signal: abortController.signal},
  )

  return () => {
    abortController.abort()
  }
})

export const currentThemeEffect = atomEffect(get => {
  const currentTheme = get(currentThemeAtom)
  try {
    if (currentTheme === Theme.Dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.add('text-foreground')
      document.documentElement.classList.add('bg-background')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.remove('text-foreground')
      document.documentElement.classList.remove('bg-background')
    }
  } catch (error) {
    logError(error)
  }
})
