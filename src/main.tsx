import '@/setup'

import {reactErrorHandler} from '@sentry/react'
import {RouterProvider} from '@tanstack/react-router'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {getRouter} from './router'

function App() {
  const [router] = useState(() => getRouter())

  return <RouterProvider router={router} />
}

function render() {
  // #root is always found
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- its guaranteed to be there
  createRoot(document.getElementById('root')!, {
    // Callback called when an error is thrown and not caught by an ErrorBoundary.
    onUncaughtError: reactErrorHandler((error, errorInfo) => {
      console.warn('Uncaught error', error, errorInfo.componentStack)
    }),
    // Callback called when React catches an error in an ErrorBoundary.
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
