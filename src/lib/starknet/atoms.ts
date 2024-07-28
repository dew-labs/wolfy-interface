import {atom} from 'jotai'
import type {WalletAccount} from 'starknet'

import {DEFAULT_CHAIN_ID} from '@/constants/chains'

export const walletAccountAtom = atom<WalletAccount>()

export const walletChainIdAtom = atom<string>()

export const chainIdAtom = atom(DEFAULT_CHAIN_ID)
