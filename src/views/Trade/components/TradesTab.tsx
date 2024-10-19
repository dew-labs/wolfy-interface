import {
  Select,
  SelectItem,
  SelectSection,
  type SharedSelection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {memo, useCallback, useMemo, useState} from 'react'

import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTradeHistory from '@/lib/trade/hooks/useTradeHistory'
import {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'

const actionOptions = {
  'Market increases': [
    {label: 'Request Market Increase', value: TradeHistoryAction.RequestMarketIncrease},
    {label: 'Market Increase', value: TradeHistoryAction.MarketIncrease},
    {label: 'Failed Market Increase', value: TradeHistoryAction.FailedMarketIncrease},
    {label: 'Cancel Market Increase', value: TradeHistoryAction.CancelMarketIncrease},
  ],
  'Market decreases': [
    {label: 'Request Market Decrease', value: TradeHistoryAction.RequestMarketDecrease},
    {label: 'Market Decrease', value: TradeHistoryAction.MarketDecrease},
    {label: 'Failed Market Decrease', value: TradeHistoryAction.FailedMarketDecrease},
    {label: 'Cancel Market Decrease', value: TradeHistoryAction.CancelMarketDecrease},
  ],
  'Limit orders': [
    {label: 'Create Limit Order', value: TradeHistoryAction.CreateLimitOrder},
    {label: 'Update Limit Order', value: TradeHistoryAction.UpdateLimitOrder},
    {label: 'Execute Limit Order', value: TradeHistoryAction.ExecuteLimitOrder},
    {label: 'Failed Limit Order', value: TradeHistoryAction.FailedLimitOrder},
    {label: 'Cancel Limit Order', value: TradeHistoryAction.CancelLimitOrder},
  ],
  'Take-profit orders': [
    {label: 'Create Take-Profit Order', value: TradeHistoryAction.CreateTakeProfitOrder},
    {label: 'Update Take-Profit Order', value: TradeHistoryAction.UpdateTakeProfitOrder},
    {label: 'Execute Take-Profit Order', value: TradeHistoryAction.ExecuteTakeProfitOrder},
    {label: 'Failed Take-Profit Order', value: TradeHistoryAction.FailedTakeProfitOrder},
    {label: 'Cancel Take-Profit Order', value: TradeHistoryAction.CancelTakeProfitOrder},
  ],
  'Stop-loss orders': [
    {label: 'Create Stop-Loss Order', value: TradeHistoryAction.CreateStopLossOrder},
    {label: 'Update Stop-Loss Order', value: TradeHistoryAction.UpdateStopLossOrder},
    {label: 'Execute Stop-Loss Order', value: TradeHistoryAction.ExecuteStopLossOrder},
    {label: 'Failed Stop-Loss Order', value: TradeHistoryAction.FailedStopLossOrder},
    {label: 'Cancel Stop-Loss Order', value: TradeHistoryAction.CancelStopLossOrder},
  ],
  'Market swaps': [
    {label: 'Request Market Swap', value: TradeHistoryAction.RequestMarketSwap},
    {label: 'Execute Market Swap', value: TradeHistoryAction.ExecuteMarketSwap},
    {label: 'Failed Market Swap', value: TradeHistoryAction.FailedMarketSwap},
    {label: 'Cancel Market Swap', value: TradeHistoryAction.CancelMarketSwap},
  ],
  'Limit swaps': [
    {label: 'Create Limit Swap', value: TradeHistoryAction.CreateLimitSwap},
    {label: 'Update Limit Swap', value: TradeHistoryAction.UpdateLimitSwap},
    {label: 'Execute Limit Swap', value: TradeHistoryAction.ExecuteLimitSwap},
    {label: 'Failed Limit Swap', value: TradeHistoryAction.FailedLimitSwap},
    {label: 'Cancel Limit Swap', value: TradeHistoryAction.CancelLimitSwap},
  ],
  'Deposits': [
    {label: 'Request Deposit', value: TradeHistoryAction.RequestDeposit},
    {label: 'Deposit', value: TradeHistoryAction.Deposit},
    {label: 'Failed Deposit', value: TradeHistoryAction.FailedDeposit},
    {label: 'Cancel Deposit', value: TradeHistoryAction.CancelDeposit},
  ],
  'Withdraws': [
    {label: 'Request Withdraw', value: TradeHistoryAction.RequestWithdraw},
    {label: 'Withdraw', value: TradeHistoryAction.Withdraw},
    {label: 'Failed Withdraw', value: TradeHistoryAction.FailedWithdraw},
    {label: 'Cancel Withdraw', value: TradeHistoryAction.CancelWithdraw},
  ],
  'Liquidations': [{label: 'Liquidation', value: TradeHistoryAction.Liquidation}],
}

const headingClasses =
  'flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small'

export default memo(function TradesTab() {
  const marketsData = useMarketsData()

  const markets = useMemo(() => {
    return Array.from(marketsData?.values() ?? []).map(market => ({
      label: market.name,
      value: market.marketTokenAddress,
    }))
  }, [marketsData])

  const marketOptions = useMemo(() => {
    return {
      Direction: [
        {label: 'Long', value: '--long--'},
        {label: 'Short', value: '--short--'},
        {label: 'Swap', value: '--swap--'},
      ],
      Markets: markets,
    } as const
  }, [markets])

  const [selectedActions, setSelectedActions] = useState<TradeHistoryAction[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])

  const tradeHistory = useTradeHistory(selectedActions, selectedMarkets)

  const onActionChange = useCallback((action: SharedSelection) => {
    // TODO: validate action value with isSupportedAction instead of type assertion
    setSelectedActions(Array.from(action) as TradeHistoryAction[])
  }, [])

  const onMarketChange = useCallback((market: SharedSelection) => {
    setSelectedMarkets(Array.from(market) as string[])
  }, [])

  return (
    <>
      <Table
        className='mt-2'
        aria-label='Trade History Table'
        classNames={{
          th: '!rounded-none',
        }}
      >
        <TableHeader>
          <TableColumn>
            <Select
              classNames={{
                base: 'w-max -mx-[0.6875rem] min-w-[100px]',
                mainWrapper: 'w-full',
                value: 'pr-6 truncate-none text-xs',
                label: 'text-xs',
              }}
              label='Action'
              selectionMode='multiple'
              // selectedKeys={selectedActions}
              onSelectionChange={onActionChange}
              listboxProps={{
                itemClasses: {
                  base: [
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
                  content: 'p-1 bg-background min-w-max',
                },
              }}
              scrollShadowProps={{
                isEnabled: false,
              }}
              items={Array.from(Object.entries(actionOptions))}
            >
              {([category, actions]) => (
                <SelectSection
                  key={category}
                  title={category}
                  classNames={{
                    heading: headingClasses,
                    base: 'last:mb-0',
                  }}
                >
                  {actions.map(action => (
                    <SelectItem key={action.value} value={action.value} className='text-nowrap'>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectSection>
              )}
            </Select>
          </TableColumn>
          <TableColumn>
            <Select
              classNames={{
                base: 'w-max -mx-[0.6875rem] min-w-[100px]',
                mainWrapper: 'w-full',
                value: 'pr-6 truncate-none',
                label: 'text-xs',
              }}
              label='Market'
              selectionMode='multiple'
              onSelectionChange={onMarketChange}
              listboxProps={{
                itemClasses: {
                  base: [
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
                  content: 'p-1 bg-background min-w-max',
                },
              }}
              scrollShadowProps={{
                isEnabled: false,
              }}
              items={Array.from(Object.entries(marketOptions))}
            >
              {([category, markets]) => (
                <SelectSection
                  key={category}
                  title={category}
                  classNames={{
                    heading: headingClasses,
                    base: 'last:mb-0',
                  }}
                >
                  {markets.map(action => (
                    <SelectItem key={action.value} value={action.value} className='text-nowrap'>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectSection>
              )}
            </Select>
          </TableColumn>
          <TableColumn>Size</TableColumn>
          <TableColumn>Price</TableColumn>
          <TableColumn>RPnL ($)</TableColumn>
        </TableHeader>
        <TableBody items={tradeHistory ?? []} emptyContent={<div>No trade.</div>}>
          {item => (
            <TableRow key={item.id}>
              <TableCell>{item.action}</TableCell>
              <TableCell>{item.market}</TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>{item.rpnl}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
})
