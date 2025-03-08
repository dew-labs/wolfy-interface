import getStarknetCore from 'get-starknet-core'

const loadWallets = async () => {
  const [newWallets, discoveryWallets, lastConnectedWallet] = await Promise.all([
    getStarknetCore.getAvailableWallets(),
    getStarknetCore.getDiscoveryWallets(),
    getStarknetCore.getLastConnectedWallet(),
  ])

  const lowerPriorityWallets = newWallets.filter(wallet =>
    lastConnectedWallet?.id ? wallet.id !== lastConnectedWallet.id : true,
  )

  const unavailableWallets = discoveryWallets.filter(
    wallet => !newWallets.some(w => w.name === wallet.name),
  )

  return {
    lastConnectedWallet: lastConnectedWallet ?? undefined,
    lowerPriorityWallets,
    unavailableWallets,
  }
}

export default function useWallets() {
  return useQuery({queryKey: ['!wallets'], queryFn: loadWallets})
}
