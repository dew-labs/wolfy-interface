import {createLazyFileRoute} from '@tanstack/react-router'

import Faucet from '@/views/Faucet/Faucet'

export const Route = createLazyFileRoute('/faucet')({
  component: Faucet,
})
