import {atomWithStorage} from 'jotai/utils'

const tokenAddressAtom = atomWithStorage<string | undefined>('tokenAddress', undefined)

export default function useTokenAddress() {
  return useAtom(tokenAddressAtom)
}

export function useSetTokenAddress() {
  return useSetAtom(tokenAddressAtom)
}
