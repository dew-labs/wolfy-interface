import {memo, useEffect} from 'react'

import {logError} from '@/utils/logger'

import {Theme} from './theme'
import {useCurrentTheme} from './useCurrentTheme'

export default memo(function ThemeSubscriber() {
  const [currentTheme] = useCurrentTheme()

  useEffect(() => {
    try {
      if (currentTheme === Theme.Dark) {
        document.body.classList.add('dark')
        document.body.classList.add('text-foreground')
        document.body.classList.add('bg-background')
      } else {
        document.body.classList.remove('dark')
        document.body.classList.remove('text-foreground')
        document.body.classList.remove('bg-background')
      }
    } catch (error) {
      logError(error)
    }
  }, [currentTheme])

  return null
})
