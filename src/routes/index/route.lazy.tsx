import {createLazyFileRoute} from '@tanstack/react-router'

import Trade from '@/views/Trade/Trade'

export const Route = createLazyFileRoute('/')({
  component: Trade,
})
