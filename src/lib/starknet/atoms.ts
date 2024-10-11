import {atom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'
import type {WalletAccount} from 'starknet'

import {DEFAULT_CHAIN_ID} from '@/constants/chains'

export const walletAccountAtom = atom<WalletAccount>()

export const walletChainIdAtom = atom<string>()

export const chainIdAtom = atom(DEFAULT_CHAIN_ID)

export const accountAddressAtom = atom('')

export const shouldReconnectAtom = atomWithStorage('shouldReconnect', false)
