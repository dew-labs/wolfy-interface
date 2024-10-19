import {Toaster} from 'sonner'

import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'

export default function WolfyToaster() {
  const [theme] = useCurrentTheme()

  return (
    <Toaster
      richColors
      pauseWhenPageIsHidden
      closeButton
      theme={theme === Theme.Dark ? 'dark' : 'light'}
      toastOptions={{
        className: 'rounded-none font-sans',
        // important: true,
        duration: 10000,
      }}
    />
  )
}
