/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import '@/setup'

import {reactErrorHandler} from '@sentry/react'
import {RouterProvider} from '@tanstack/react-router'
import {createStore} from 'jotai'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {createQueryClient} from './queries/queries'
import {createRouter} from './router'

function App() {
  // Ensures each request has its own cache in SSR
  /* eslint-disable @eslint-react/naming-convention/use-state -- not needed */
  const [queryClient] = useState(() => createQueryClient())
  const [store] = useState(() => createStore())
  const [router] = useState(() => createRouter({queryClient, store}))
  /* eslint-enable @eslint-react/naming-convention/use-state */

  const context = useMemo(() => ({queryClient, store}), [queryClient, store])

  return <RouterProvider router={router} context={context} />
}

function render() {
  // #root is always found
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- its guaranteed to be there
  createRoot(document.getElementById('root')!, {
    // Callback called when an error is thrown and not caught by an ErrorBoundary.
    // @ts-expect-error -- `exactOptionalPropertyTypes` in library type
    onUncaughtError: reactErrorHandler((error, errorInfo) => {
      console.warn('Uncaught error', error, errorInfo.componentStack)
    }),
    // Callback called when React catches an error in an ErrorBoundary.
    // @ts-expect-error -- `exactOptionalPropertyTypes` in library type
    onCaughtError: reactErrorHandler(),
    // Callback called when React automatically recovers from errors.
    onRecoverableError: reactErrorHandler(),
  }).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

render()
/* eslint-enable @eslint-react/naming-convention/filename */
