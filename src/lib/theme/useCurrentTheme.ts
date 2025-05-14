import getPreferColorScheme from './getPreferColorScheme'
import {Theme} from './theme'
import useTheme from './useTheme'

export const currentThemeAtom = atom<typeof Theme.Dark | typeof Theme.Light>(Theme.Dark)

export function useCurrentTheme() {
  return useAtom(currentThemeAtom)
}

export function useSetCurrentTheme() {
  return useSetAtom(currentThemeAtom)
}

export function useHydrateCurrentTheme() {
  const [theme] = useTheme()

  const currentTheme = theme === Theme.System ? getPreferColorScheme() : theme

  useHydrateAtoms([[currentThemeAtom, currentTheme]])
}
