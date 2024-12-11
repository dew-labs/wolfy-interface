import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@nextui-org/react'
import {memo} from 'react'
import type {Key} from 'react-aria-components'

import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'

interface PoolSelectDropdownProps {
  availableMarkets: MarketData[]
  poolName: string | undefined
  handlePoolChange: (market: Key) => void
}

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
