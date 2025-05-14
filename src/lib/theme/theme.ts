export const Theme = {System: 'system', Light: 'light', Dark: 'dark'} as const
export type Theme = (typeof Theme)[keyof typeof Theme]

export const themeAtom = atomWithStorage<Theme>('theme', Theme.System)
