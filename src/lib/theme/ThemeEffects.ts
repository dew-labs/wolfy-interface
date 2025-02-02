import {useAtom} from 'jotai'
import {memo} from 'react'

import {currentThemeEffect, themeEffect} from './effects'
import {useHydrateCurrentTheme} from './useCurrentTheme'

export default memo(function ThemeEffects() {
  useHydrateCurrentTheme()

  useAtom(themeEffect)
  useAtom(currentThemeEffect)

  return null
})
