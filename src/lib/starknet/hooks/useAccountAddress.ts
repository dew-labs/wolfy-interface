import {useAtom, useSetAtom} from 'jotai'

import {accountAddressAtom} from '@/lib/starknet/atoms'

export default function useAccountAddress() {
  return useAtom(accountAddressAtom)[0]
}

export function useSetAccountAddress() {
  return useSetAtom(accountAddressAtom)
}
