import {createFileRoute} from '@tanstack/react-router'

import Home from '@/views/Home/Home'

export const Route = createFileRoute('/')({
  component: Home,
})
