import {Toaster} from 'sonner'

import {Theme} from '@/lib/theme/theme'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme'

const TOASTER_OPTIONS = {
  className: '!rounded-none font-sans',
  duration: 10000,
}

export default memo(function WolfyToaster() {
  const [theme] = useCurrentTheme()

  return (
    <Toaster
      expand
      visibleToasts={10}
      position='bottom-right'
      richColors
      closeButton
      theme={theme === Theme.Dark ? 'dark' : 'light'}
      toastOptions={TOASTER_OPTIONS}
    />
  )
})
