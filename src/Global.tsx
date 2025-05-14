import {announce} from '@react-aria/live-announcer'
import {addIntegration, tanstackRouterBrowserTracingIntegration} from '@sentry/react'

import UpdateMousePosition from '@/components/UpdateMousePosition'
import WolfyBackground from '@/components/WolfyBackground'
import WolfyToaster from '@/components/WolfyToaster'
import {loadSentryIntegrations} from '@/instrument'
import Head from '@/lib/head/Head'
import ChainEffects from '@/lib/starknet/components/ChainEffects'
import ThemeEffects from '@/lib/theme/ThemeEffects'
import TokenPricesUpdater from '@/lib/trade/components/TokenPricesUpdater'
import {setupWolfy, teardownWolfy} from '@/setupWolfy'
import RouteAnnouncer from '@/utils/router/RouteAnnouncer'

import {DEBUG} from './constants/config'

export default memo(function Global() {
  const router = useRouter()

  useEffect(function initLiveAnnouncer() {
    // fixes for https://github.com/adobe/react-spectrum/issues/5191
    announce(' ', 'polite', 0)
  }, [])

  useEffect(function setup() {
    setupWolfy()

    return () => {
      teardownWolfy()
    }
  }, [])

  useEffect(
    function addSentryIntegration() {
      if (DEBUG) return
      addIntegration(tanstackRouterBrowserTracingIntegration(router))
      loadSentryIntegrations()
    },
    [router],
  )
  return (
    <>
      <RouteAnnouncer />
      <WolfyBackground />
      <Head />
      <UpdateMousePosition />
      <WolfyToaster />
      <ChainEffects />
      <ThemeEffects />
      <TokenPricesUpdater />
    </>
  )
})
