import type {BigNumberish} from 'starknet'
import {toStarknetHexString} from 'wolfy-sdk'

import {accountAddressAtom} from '@/lib/starknet/atoms'

export default function useAccountAddress() {
  return [useAccountAddressValue(), useSetAccountAddress()] as const
}

export function useAccountAddressValue() {
  return useAtomValue(accountAddressAtom)
}

export function useSetAccountAddress() {
  const setAccountAddress = useSetAtom(accountAddressAtom)
  return useCallback((address: BigNumberish) => {
    setAccountAddress(toStarknetHexString(address))
  }, [])
}
