import {Select, SelectItem} from '@nextui-org/react'
import {memo} from 'react'

import {isChainIdSupported, SUPPORTED_CHAINS} from '@/constants/chains'
import useChainId from '@/lib/starknet/hooks/useChainId'

import CorrectNetworkButton from './CorrectNetworkButton'

export default memo(function ChainSelect() {
  const [chainId, setChainId] = useChainId()

  return (
    <>
      <CorrectNetworkButton />
      <Select
        aria-label='Select Network'
        items={SUPPORTED_CHAINS}
        selectedKeys={[chainId]}
        selectorIcon={<></>}
        disableSelectorIconRotation
        onSelectionChange={selection => {
          if (!selection.currentKey) return
          if (!isChainIdSupported(selection.currentKey)) return
          setChainId(selection.currentKey)
        }}
        classNames={{
          base: 'min-w-0 w-fit min-w-min',
          innerWrapper: 'w-full min-w-0',
          popoverContent: 'min-w-28',
        }}
      >
        {chain => <SelectItem key={chain.chainId}>{chain.name}</SelectItem>}
      </Select>
    </>
  )
})
