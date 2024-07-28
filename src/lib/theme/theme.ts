import {atomWithStorage} from 'jotai/utils'

export enum Theme {
  System,
  Light,
  Dark,
}

export const themeAtom = atomWithStorage<Theme>('theme', Theme.System)
