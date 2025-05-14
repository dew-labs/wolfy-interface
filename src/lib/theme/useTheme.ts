import {themeAtom} from './theme'

export default function useTheme() {
  return useAtom(themeAtom)
}

export function useSetTheme() {
  return useSetAtom(themeAtom)
}
