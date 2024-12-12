import {memo, useLayoutEffect} from 'react'

import {logError} from '@/utils/logger'

import {Theme} from './theme'
import {useCurrentTheme} from './useCurrentTheme'

export default memo(function ThemeSubscriber() {
  const [currentTheme] = useCurrentTheme()

  useLayoutEffect(() => {
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
  }, [currentTheme])

  return null
})
