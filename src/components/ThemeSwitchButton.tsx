import {Icon} from '@iconify/react'
import {Button} from '@nextui-org/react'
import {memo} from 'react'
import {useLatest} from 'react-use'

import {Theme} from '@/lib/theme/theme'
import useTheme from '@/lib/theme/useTheme'
import useCallback from '@/utils/hooks/useCallback'

export default memo(function ThemeSwitchButton() {
  const [theme, setTheme] = useTheme()
  const latestTheme = useLatest(theme)

  const handleCorrectNetwork = useCallback(() => {
    const nextTheme = (() => {
      if (latestTheme.current === Theme.Dark) return Theme.Light
      if (latestTheme.current === Theme.Light) return Theme.System
      return Theme.Dark
    })()

    setTheme(nextTheme)
  }, [setTheme])

  const icon = (() => {
    switch (theme) {
      case Theme.Dark:
        return 'ic:outline-dark-mode'
      case Theme.Light:
        return 'ic:outline-light-mode'
      case Theme.System:
        return 'line-md:light-dark'
    }
  })()

  const color = (() => {
    switch (theme) {
      case Theme.Dark:
        return 'primary'
      case Theme.Light:
        return 'default'
      case Theme.System:
        return 'default'
    }
  })()

  return (
    <Button isIconOnly color={color} onPress={handleCorrectNetwork}>
      <Icon icon={icon} />
    </Button>
  )
})
