import {Button} from '@heroui/react'
import {Icon} from '@iconify/react'

import {Theme} from '@/lib/theme/theme'
import useTheme from '@/lib/theme/useTheme'

export default memo(function ThemeSwitchButton() {
  const [theme, setTheme] = useTheme()
  const latestTheme = useLatest(theme)

  const handleSwitchTheme = useCallback(() => {
    const nextTheme = (() => {
      if (latestTheme.current === Theme.Dark) return Theme.Light
      if (latestTheme.current === Theme.Light) return Theme.System
      return Theme.Dark
    })()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- not supported in all browsers
    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    document.startViewTransition(() => {
      setTheme(nextTheme)
    })
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
    <Button isIconOnly color={color} onPress={handleSwitchTheme}>
      <Icon icon={icon} />
    </Button>
  )
})
