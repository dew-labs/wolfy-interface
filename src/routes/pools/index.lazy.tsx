import {createLazyFileRoute} from '@tanstack/react-router'

import Pools from '@/views/Pools/Pools'

export const Route = createLazyFileRoute('/pools/')({component: Pools})
