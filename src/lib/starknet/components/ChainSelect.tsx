import {Select, SelectItem, type SharedSelection} from '@nextui-org/react'
import {memo, useCallback, useMemo} from 'react'

import {isChainIdSupported, SUPPORTED_CHAINS} from '@/constants/chains'
import useChainId from '@/lib/starknet/hooks/useChainId'

import CorrectNetworkButton from './CorrectNetworkButton'

const SELECT_CLASS_NAMES = {
  base: 'min-w-0 w-fit min-w-min',
  innerWrapper: 'w-full min-w-0',
  popoverContent: 'min-w-28',
}

export default memo(function ChainSelect() {
  const [chainId, setChainId] = useChainId()

  const onSelectionChange = useCallback(
    (selection: SharedSelection) => {
      if (!selection.currentKey) return
      if (!isChainIdSupported(selection.currentKey)) return
      setChainId(selection.currentKey)
    },
    [setChainId],
  )

  const selectedKeys = useMemo(() => [chainId], [chainId])

  return (
    <>
      <CorrectNetworkButton />
      <Select
        aria-label='Select Network'
        items={SUPPORTED_CHAINS}
        selectedKeys={selectedKeys}
        selectorIcon={<></>}
        disableSelectorIconRotation
        onSelectionChange={onSelectionChange}
        classNames={SELECT_CLASS_NAMES}
      >
        {chain => <SelectItem key={chain.chainId}>{chain.name}</SelectItem>}
      </Select>
    </>
  )
})
