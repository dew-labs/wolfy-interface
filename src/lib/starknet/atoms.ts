import {atomWithStorage} from 'jotai/utils'
import type {WalletAccount} from 'starknet'

import {DEFAULT_CHAIN_ID} from '@/constants/chains'

export const walletAccountAtom = atom<WalletAccount>()

export const walletChainIdAtom = atom<string>()

export const chainIdAtom = atomWithStorage('chainId', DEFAULT_CHAIN_ID)

export const accountAddressAtom = atom<string | undefined>(undefined)

export const shouldReconnectAtom = atomWithStorage('shouldReconnect', false)
