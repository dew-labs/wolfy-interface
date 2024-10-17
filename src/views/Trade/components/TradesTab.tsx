import {
  Autocomplete,
  AutocompleteItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {memo, useState} from 'react'

interface TradeData {
  action: string
  market: string
  size: number
  price: number
  rpnl: number
}

const actionOptions = [
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
  'Execute Market Swap',
  'Execute Limit Swap',
  'Create Limit Swap',
  'Update Limit Swap',
  'Cancel Limit Swap',
  'Failed Market Swap',
  'Failed Limit Swap',
  'Request Market Swap',
  'Liquidated',
]

const marketOptions = ['Longs', 'Shorts', 'Swaps', 'wfSTRK / USD', 'wfETH / USD', 'wfBTC / USD']

const trades: TradeData[] = [
  {action: 'Market Increase', market: 'Longs', size: 1, price: 50000, rpnl: 100},
  {action: 'Market Increase', market: 'wfSTRK / USD', size: 2, price: 3000, rpnl: 50},
  {action: 'Create Limit Order', market: 'wfETH / USD', size: 3, price: 1.2, rpnl: 30},
  {action: 'Sell', market: 'Longs', size: 4, price: 0.25, rpnl: -10},
]

export default memo(function TradesTab() {
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')

  const filteredData = trades.filter(data => {
    const actionMatches = selectedAction ? data.action === selectedAction : true
    const marketMatches = selectedMarket ? data.market === selectedMarket : true
    return actionMatches && marketMatches
  })

  return (
    <>
      <Table aria-label='Trade History Table'>
        <TableHeader>
          <TableColumn>
            <Autocomplete
              classNames={{
                base: 'max-w-xs',
                listboxWrapper: 'max-h-[320px]',
                selectorButton: 'text-default-500',
              }}
              placeholder='Search Action'
              onSelectionChange={action => {
                setSelectedAction(action as string)
              }}
              inputProps={{
                classNames: {
                  input: 'ml-1',
                  inputWrapper: 'h-[48px]',
                },
              }}
              listboxProps={{
                hideSelectedIcon: true,
                itemClasses: {
                  base: [
                    'rounded-medium',
                    'text-default-500',
                    'transition-opacity',
                    'data-[hover=true]:text-foreground',
                    'dark:data-[hover=true]:bg-default-50',
                    'data-[pressed=true]:opacity-70',
                    'data-[hover=true]:bg-default-200',
                    'data-[selectable=true]:focus:bg-default-100',
                    'data-[focus-visible=true]:ring-default-500',
                  ],
                },
              }}
              popoverProps={{
                offset: 10,
                classNames: {
                  base: 'rounded-large',
                  content: 'p-1 border-small border-default-100 bg-background',
                },
              }}
            >
              {actionOptions.map(action => (
                <AutocompleteItem key={action} value={action}>
                  {action}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </TableColumn>
          <TableColumn>
            <Autocomplete
              classNames={{
                base: 'max-w-xs',
                listboxWrapper: 'max-h-[320px]',
                selectorButton: 'text-default-500',
              }}
              placeholder='Search Market'
              onSelectionChange={market => {
                setSelectedMarket(market as string)
              }}
              inputProps={{
                classNames: {
                  input: 'ml-1',
                  inputWrapper: 'h-[48px]',
                },
              }}
              listboxProps={{
                hideSelectedIcon: true,
                itemClasses: {
                  base: [
                    'rounded-medium',
                    'text-default-500',
                    'transition-opacity',
                    'data-[hover=true]:text-foreground',
                    'dark:data-[hover=true]:bg-default-50',
                    'data-[pressed=true]:opacity-70',
                    'data-[hover=true]:bg-default-200',
                    'data-[selectable=true]:focus:bg-default-100',
                    'data-[focus-visible=true]:ring-default-500',
                  ],
                },
              }}
              popoverProps={{
                offset: 10,
                classNames: {
                  base: 'rounded-large',
                  content: 'p-1 border-small border-default-100 bg-background',
                },
              }}
            >
              {marketOptions.map(market => (
                <AutocompleteItem key={market} value={market}>
                  {market}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </TableColumn>
          <TableColumn>SIZE</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>RPNL ($)</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredData.map(trade => (
            <TableRow key={trade.action + trade.market}>
              <TableCell>{trade.action}</TableCell>
              <TableCell>{trade.market}</TableCell>
              <TableCell>{trade.size}</TableCell>
              <TableCell>{trade.price}</TableCell>
              <TableCell>{trade.rpnl}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
})
