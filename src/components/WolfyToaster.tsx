import {Toaster} from 'sonner'

import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'

const TOASTER_OPTIONS = {
  className: 'rounded-none font-sans',
  // important: true,
  duration: 10000,
}

export default function WolfyToaster() {
  const [theme] = useCurrentTheme()

  return (
    <Toaster
      richColors
      pauseWhenPageIsHidden
      closeButton
      theme={theme === Theme.Dark ? 'dark' : 'light'}
      toastOptions={TOASTER_OPTIONS}
    />
  )
}
