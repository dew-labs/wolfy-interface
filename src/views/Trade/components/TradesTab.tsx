import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@nextui-org/dropdown'
import {
  Button,
  Checkbox,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {t} from 'i18next'
import {memo, useCallback, useMemo, useReducer} from 'react'

interface Trade {
  id: number
  action: string
  market: string
  size: string
  price: string
  rpnl: string
}

type GroupType = Record<string, string[]>

interface State {
  selectedActions: string[]
  selectedMarkets: string[]
  searchActionQuery: string
  searchMarketQuery: string
}

type ActionType =
  | {type: 'ADD_SELECTED_ACTION'; payload: string}
  | {type: 'REMOVE_SELECTED_ACTION'; payload: string}
  | {type: 'ADD_SELECTED_MARKET'; payload: string}
  | {type: 'REMOVE_SELECTED_MARKET'; payload: string}
  | {type: 'SET_SEARCH_ACTION_QUERY'; payload: string}
  | {type: 'SET_SEARCH_MARKET_QUERY'; payload: string}
  | {type: 'CLEAR_SELECTION'; payload: 'action' | 'market'}
  | {type: 'ADD_MULTIPLE_SELECTED_ACTIONS'; payload: string[]}
  | {type: 'REMOVE_MULTIPLE_SELECTED_ACTIONS'; payload: string[]}
  | {type: 'ADD_MULTIPLE_SELECTED_MARKETS'; payload: string[]}
  | {type: 'REMOVE_MULTIPLE_SELECTED_MARKETS'; payload: string[]}

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'ADD_SELECTED_ACTION':
      return {
        ...state,
        selectedActions: [...state.selectedActions, action.payload],
      }
    case 'REMOVE_SELECTED_ACTION':
      return {
        ...state,
        selectedActions: state.selectedActions.filter(a => a !== action.payload),
      }
    case 'ADD_MULTIPLE_SELECTED_ACTIONS':
      return {
        ...state,
        selectedActions: [...state.selectedActions, ...action.payload],
      }
    case 'REMOVE_MULTIPLE_SELECTED_ACTIONS':
      return {
        ...state,
        selectedActions: state.selectedActions.filter(a => !action.payload.includes(a)),
      }
    case 'ADD_SELECTED_MARKET':
      return {
        ...state,
        selectedMarkets: [...state.selectedMarkets, action.payload],
      }
    case 'REMOVE_SELECTED_MARKET':
      return {
        ...state,
        selectedMarkets: state.selectedMarkets.filter(m => m !== action.payload),
      }
    case 'ADD_MULTIPLE_SELECTED_MARKETS':
      return {
        ...state,
        selectedMarkets: [...state.selectedMarkets, ...action.payload],
      }
    case 'REMOVE_MULTIPLE_SELECTED_MARKETS':
      return {
        ...state,
        selectedMarkets: state.selectedMarkets.filter(m => !action.payload.includes(m)),
      }
    case 'SET_SEARCH_ACTION_QUERY':
      return {
        ...state,
        searchActionQuery: action.payload,
      }
    case 'SET_SEARCH_MARKET_QUERY':
      return {
        ...state,
        searchMarketQuery: action.payload,
      }
    case 'CLEAR_SELECTION':
      return {
        ...state,
        [action.payload === 'action' ? 'selectedActions' : 'selectedMarkets']: [],
      }
    default:
      return state
  }
}

const TradeTabs = () => {
  const trades: Trade[] = useMemo(
    () => [
      {
        id: 1,
        action: 'Market Increase',
        market: 'Longs',
        size: '0.5',
        price: '50000',
        rpnl: '+1500',
      },
      {
        id: 2,
        action: 'Request Withdraw',
        market: 'Shorts',
        size: '1.0',
        price: '3000',
        rpnl: '-200',
      },
      {
        id: 3,
        action: 'Execute Limit Order',
        market: 'Longs',
        size: '2.0',
        price: '3100',
        rpnl: '+100',
      },
      {
        id: 4,
        action: 'Execute Market Swap',
        market: 'Swaps',
        size: '1.5',
        price: '48000',
        rpnl: '+500',
      },
    ],
    [],
  )

  const actionGroups: GroupType = useMemo(
    () => ({
      'Market Orders': [
        'Market Increase',
        'Market Decrease',
        'Deposit',
        'Withdraw',
        'Failed Market Increase',
        'Failed Market Decrease',
        'Failed Deposit',
        'Failed Withdraw',
        'Request Market Increase',
        'Request Market Decrease',
        'Request Deposit',
        'Request Withdraw',
      ],
      'Trigger Orders': [
        'Execute Limit Order',
        'Execute Take-Profit Order',
        'Execute Stop-Loss Order',
        'Create Limit Order',
        'Create Take-Profit Order',
        'Create Stop-Loss Order',
        'Update Limit Order',
        'Update Take-Profit Order',
        'Update Stop-Loss Order',
        'Cancel Limit Order',
        'Cancel Take-Profit Order',
        'Cancel Stop-Loss Order',
        'Failed Limit Order',
        'Failed Take-Profit Order',
        'Failed Stop-Loss Order',
      ],
      'Swaps': [
        'Execute Market Swap',
        'Execute Limit Swap',
        'Create Limit Swap',
        'Update Limit Swap',
        'Cancel Limit Swap',
        'Failed Market Swap',
        'Failed Limit Swap',
        'Request Market Swap',
      ],
      'Liquidation': ['Liquidated'],
    }),
    [],
  )

  const marketGroups: GroupType = useMemo(
    () => ({
      Direction: ['Longs', 'Shorts', 'Swaps'],
    }),
    [],
  )

  const initialState: State = {
    selectedActions: [],
    selectedMarkets: [],
    searchActionQuery: '',
    searchMarketQuery: '',
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo(
    () => [
      {key: 'Market Orders', name: 'Market Orders'},
      ...(actionGroups['Market Orders'] ?? []).map(action => ({key: action, name: action})),
      {key: 'Trigger Orders', name: 'Trigger Orders'},
      ...(actionGroups['Trigger Orders'] ?? []).map(action => ({key: action, name: action})),
      {key: 'Swaps', name: 'Swaps'},
      ...(actionGroups.Swaps ?? []).map(action => ({key: action, name: action})),
      {key: 'Liquidation', name: 'Liquidation'},
      ...(actionGroups.Liquidation ?? []).map(action => ({key: action, name: action})),
    ],
    [actionGroups],
  )

  const markets = useMemo(
    () => [
      {key: 'Direction', name: 'Direction'},
      ...(marketGroups.Direction ?? []).map(market => ({key: market, name: market})),
    ],
    [marketGroups],
  )

  const isGroupSelected = useCallback(
    (groupKey: string, type: 'action' | 'market'): boolean => {
      const groupItems = type === 'action' ? actionGroups[groupKey] : marketGroups[groupKey]
      const selectedItems = type === 'action' ? state.selectedActions : state.selectedMarkets
      if (!groupItems) return false
      return groupItems.every(item => selectedItems.includes(item))
    },
    [actionGroups, marketGroups, state.selectedActions, state.selectedMarkets],
  )

  const isGroupIndeterminate = (groupKey: string, type: 'action' | 'market'): boolean => {
    const groupItems = type === 'action' ? actionGroups[groupKey] : marketGroups[groupKey]
    const selectedItems = type === 'action' ? state.selectedActions : state.selectedMarkets
    if (!groupItems) return false
    return groupItems.some(item => selectedItems.includes(item)) && !isGroupSelected(groupKey, type)
  }

  const handleCheckboxChange = useCallback(
    (key: string, type: 'action' | 'market') => {
      const selectedItems = type === 'action' ? state.selectedActions : state.selectedMarkets
      const groupItems = type === 'action' ? actionGroups[key] : marketGroups[key]
      const isParentGroup = !!groupItems

      if (isParentGroup) {
        const isSelected = isGroupSelected(key, type)
        if (isSelected) {
          dispatch({
            type:
              type === 'action'
                ? 'REMOVE_MULTIPLE_SELECTED_ACTIONS'
                : 'REMOVE_MULTIPLE_SELECTED_MARKETS',
            payload: groupItems,
          })
        } else {
          dispatch({
            type:
              type === 'action' ? 'ADD_MULTIPLE_SELECTED_ACTIONS' : 'ADD_MULTIPLE_SELECTED_MARKETS',
            payload: groupItems,
          })
        }
      } else {
        const actionType = selectedItems.includes(key)
          ? type === 'action'
            ? 'REMOVE_SELECTED_ACTION'
            : 'REMOVE_SELECTED_MARKET'
          : type === 'action'
            ? 'ADD_SELECTED_ACTION'
            : 'ADD_SELECTED_MARKET'
        dispatch({type: actionType, payload: key})
      }
    },
    [state.selectedActions, state.selectedMarkets, actionGroups, marketGroups, isGroupSelected],
  )

  const clearSelection = useCallback((type: 'action' | 'market') => {
    dispatch({type: 'CLEAR_SELECTION', payload: type})
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: 'action' | 'market') => {
      const actionType = type === 'action' ? 'SET_SEARCH_ACTION_QUERY' : 'SET_SEARCH_MARKET_QUERY'
      dispatch({type: actionType, payload: e.target.value.toLowerCase()})
    },
    [],
  )

  const filteredActions = useMemo(
    () => actions.filter(action => action.name.toLowerCase().includes(state.searchActionQuery)),
    [actions, state.searchActionQuery],
  )

  const filteredMarkets = useMemo(
    () => markets.filter(market => market.name.toLowerCase().includes(state.searchMarketQuery)),
    [markets, state.searchMarketQuery],
  )

  const renderDropdownItems = (items: {key: string; name: string}[], type: 'action' | 'market') =>
    items.map(item => {
      const isParent = type === 'action' ? item.key in actionGroups : item.key in marketGroups
      return (
        <DropdownItem key={item.key} textValue={item.name}>
          <div className={`flex items-center ${!isParent ? 'pl-5' : ''}`}>
            <Checkbox
              isSelected={
                isGroupSelected(item.key, type)
                  ? true
                  : type === 'action'
                    ? state.selectedActions.includes(item.key)
                    : state.selectedMarkets.includes(item.key)
              }
              isIndeterminate={isGroupIndeterminate(item.key, type)}
              onChange={() => {
                handleCheckboxChange(item.key, type)
              }}
            >
              {item.name}
            </Checkbox>
          </div>
        </DropdownItem>
      )
    })

  return (
    <Table className='mt-2' aria-label='Trades'>
      <TableHeader>
        <TableColumn>
          <Dropdown>
            <DropdownTrigger>
              <Button className='border-none bg-transparent shadow-none'>{t('Action')}</Button>
            </DropdownTrigger>
            <DropdownMenu closeOnSelect={false} className='max-h-64 overflow-y-auto'>
              <DropdownItem key='search-action-input'>
                <Input
                  placeholder={t('Search Action')}
                  value={state.searchActionQuery}
                  onChange={e => {
                    handleSearchChange(e, 'action')
                  }}
                  className='mb-2'
                />
              </DropdownItem>
              <DropdownItem
                key='clear-action-selection'
                onClick={() => {
                  clearSelection('action')
                }}
                className='cursor-pointer text-red-500'
              >
                {t('Clear Selection')}
              </DropdownItem>
              <>{renderDropdownItems(filteredActions, 'action')}</>
            </DropdownMenu>
          </Dropdown>
        </TableColumn>

        <TableColumn>
          <Dropdown>
            <DropdownTrigger>
              <Button className='border-none bg-transparent shadow-none'>{t('Market')}</Button>
            </DropdownTrigger>
            <DropdownMenu closeOnSelect={false} className='max-h-64 overflow-y-auto'>
              <DropdownItem key='search-market-input'>
                <Input
                  placeholder={t('Search Market')}
                  value={state.searchMarketQuery}
                  onChange={e => {
                    handleSearchChange(e, 'market')
                  }}
                  className='mb-2'
                />
              </DropdownItem>
              <DropdownItem
                key='clear-market-selection'
                onClick={() => {
                  clearSelection('market')
                }}
                className='cursor-pointer text-red-500'
              >
                {t('ClearSelection')}
              </DropdownItem>
              <>{renderDropdownItems(filteredMarkets, 'market')}</>
            </DropdownMenu>
          </Dropdown>
        </TableColumn>

        <TableColumn>{t('Size')}</TableColumn>
        <TableColumn>{t('Price')}</TableColumn>
        <TableColumn>{t('RPNL')}</TableColumn>
      </TableHeader>
      <TableBody>
        {trades
          .filter(
            trade =>
              (state.selectedActions.length === 0 ||
                state.selectedActions.includes(trade.action)) &&
              (state.selectedMarkets.length === 0 || state.selectedMarkets.includes(trade.market)),
          )
          .map(trade => (
            <TableRow key={trade.id}>
              <TableCell>{trade.action}</TableCell>
              <TableCell>{trade.market}</TableCell>
              <TableCell>{trade.size}</TableCell>
              <TableCell>{trade.price}</TableCell>
              <TableCell>{trade.rpnl}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
export default memo(TradeTabs)
