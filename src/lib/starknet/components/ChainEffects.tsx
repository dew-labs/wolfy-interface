import {requestChainSwitchEffect, walletChainIdChangeEffect} from '@/lib/starknet/effects'

export default memo(function ChainEffects() {
  useAtom(requestChainSwitchEffect)
  useAtom(walletChainIdChangeEffect)

  return null
})
