import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react'
import {type Key} from '@react-types/shared'

import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'

interface PoolSelectDropdownProps {
  availableMarkets: MarketData[]
  poolName: string | undefined
  handlePoolChange: MemoizedCallbackOrDispatch<Key>
}

// TODO: provide more information about the pool
export default memo(function PoolSelectDropdown({
  availableMarkets,
  poolName,
  handlePoolChange,
}: PoolSelectDropdownProps) {
  return (
    <Dropdown backdrop='opaque'>
      <DropdownTrigger>
        <Button variant='flat'>{poolName}</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label='Change pool' onAction={handlePoolChange} items={availableMarkets}>
        {market => {
          return (
            <DropdownItem key={market.marketTokenAddress}>{getMarketPoolName(market)}</DropdownItem>
          )
        }}
      </DropdownMenu>
    </Dropdown>
  )
})
