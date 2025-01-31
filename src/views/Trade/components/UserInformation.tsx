import {Tab, Tabs} from '@heroui/react'

import OrdersTab from './OrdersTab'
import PositionsTab from './PositionsTab'
import TradesTab from './TradesTab'

enum UserTabs {
  Positions = 'Positions',
  Orders = 'Orders',
  Trades = 'Trades',
  Claims = 'Claims',
}

const AVAILABLE_TABS = [
  UserTabs.Positions,
  UserTabs.Orders,
  UserTabs.Trades,
  // UserTabs.Claims
]

const TABS_LABEL: Record<UserTabs, string> = {
  [UserTabs.Positions]: 'Positions',
  [UserTabs.Orders]: 'Orders',
  [UserTabs.Trades]: 'Trades',
  [UserTabs.Claims]: 'Claims',
}

// function UserTrades() {
//   return <div>Comming soon...</div>
// }

function UserClaims() {
  return <div>Comming soon...</div>
}

export default memo(function UserInformation() {
  const [tab, setTab] = useState<UserTabs>(UserTabs.Positions)

  const handleChangeTab = useCallback((value: unknown) => {
    setTab(value as UserTabs)
  }, [])

  return (
    <>
      <Tabs
        size='sm'
        variant='light'
        selectedKey={tab}
        onSelectionChange={handleChangeTab}
        aria-label='Tabs'
        className='mt-2'
      >
        {AVAILABLE_TABS.map(tab => (
          <Tab key={tab} title={TABS_LABEL[tab]} />
        ))}
      </Tabs>
      {tab === UserTabs.Positions && <PositionsTab />}
      {tab === UserTabs.Orders && <OrdersTab />}
      {tab === UserTabs.Trades && <TradesTab />}
      {tab === UserTabs.Claims && <UserClaims />}
    </>
  )
})
