import {useAtom, useSetAtom} from 'jotai'

import {accountAddress} from '@/lib/starknet/atoms'

export default function useAccountAddress() {
  return useAtom(accountAddress)[0]
}

export function useSetAccountAddress() {
  return useSetAtom(accountAddress)
}
