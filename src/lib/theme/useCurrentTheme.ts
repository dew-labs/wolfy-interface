import {atom, useAtom, useSetAtom} from 'jotai'
import {useHydrateAtoms} from 'jotai/utils'

import getPreferColorScheme from './getPreferColorScheme'
import {Theme} from './theme'
import useTheme from './useTheme'

const currentThemeAtom = atom<Theme.Dark | Theme.Light>(Theme.Dark)

export function useCurrentTheme() {
  return useAtom(currentThemeAtom)
}

export function useSetCurrentTheme() {
  return useSetAtom(currentThemeAtom)
}

export function useHydrateCurrentTheme() {
  const [theme] = useTheme()

  let currentTheme: Theme.Light | Theme.Dark
  if (theme === Theme.System) {
    currentTheme = getPreferColorScheme()
  } else {
    currentTheme = theme
  }

  useHydrateAtoms([[currentThemeAtom, currentTheme]])
}
