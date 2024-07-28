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
        items={SUPPORTED_CHAINS}
        selectedKeys={[chainId]}
        onSelectionChange={selection => {
          if (!selection.currentKey) return
          if (!isChainIdSupported(selection.currentKey)) return
          setChainId(selection.currentKey)
        }}
        className='min-w-28'
      >
        {chain => <SelectItem key={chain.chainId}>{chain.name}</SelectItem>}
      </Select>
    </>
  )
})
