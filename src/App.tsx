import {RouterProvider} from '@tanstack/react-router'
import {createStore} from 'jotai'

import {createQueryClient} from './queries/queries'
import {createRouter} from './router'

function App() {
  // Ensures each request has its own cache in SSR
  const [queryClient] = useState(() => createQueryClient())
  const [store] = useState(() => createStore())
  const [router] = useState(() => createRouter({queryClient, store}))

  const context = useMemo(() => ({queryClient, store}), [queryClient, store])

  return <RouterProvider router={router} context={context} />
}

export default App
