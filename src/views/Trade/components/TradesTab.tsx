import {
  Pagination,
  Select,
  SelectItem,
  SelectSection,
  type SharedSelection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {t} from 'i18next'
import {memo, useCallback, useMemo, useState} from 'react'
import {cairoIntToBigInt} from 'satoru-sdk'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTradeHistory from '@/lib/trade/hooks/useTradeHistory'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

interface TradeHistoryItem {
  id: string
  action: TradeHistoryAction
  market: string
  size: string
  price: string
  rpnl: string
  fee: string
  createdAt: number
  isLong: boolean
}

const actionOptions = {
  'Market increases': [
    {label: 'Request Market Increase', value: TradeHistoryAction.RequestMarketIncrease}, //0
    {label: 'Market Increase', value: TradeHistoryAction.MarketIncrease}, //1
    {label: 'Failed Market Increase', value: TradeHistoryAction.FailedMarketIncrease}, //2
    {label: 'Cancel Market Increase', value: TradeHistoryAction.CancelMarketIncrease}, //3
  ],
  'Market decreases': [
    {label: 'Request Market Decrease', value: TradeHistoryAction.RequestMarketDecrease}, //4
    {label: 'Market Decrease', value: TradeHistoryAction.MarketDecrease}, //5
    {label: 'Failed Market Decrease', value: TradeHistoryAction.FailedMarketDecrease}, //6
    {label: 'Cancel Market Decrease', value: TradeHistoryAction.CancelMarketDecrease}, //7
  ],
  'Limit orders': [
    {label: 'Create Limit Order', value: TradeHistoryAction.CreateLimitOrder}, //8
    {label: 'Update Limit Order', value: TradeHistoryAction.UpdateLimitOrder}, //9
    {label: 'Execute Limit Order', value: TradeHistoryAction.ExecuteLimitOrder}, //10
    {label: 'Failed Limit Order', value: TradeHistoryAction.FailedLimitOrder}, //11
    {label: 'Cancel Limit Order', value: TradeHistoryAction.CancelLimitOrder}, //12
  ],
  'Take-profit orders': [
    {label: 'Create Take-Profit Order', value: TradeHistoryAction.CreateTakeProfitOrder}, //13
    {label: 'Update Take-Profit Order', value: TradeHistoryAction.UpdateTakeProfitOrder}, //14
    {label: 'Execute Take-Profit Order', value: TradeHistoryAction.ExecuteTakeProfitOrder}, //15
    {label: 'Failed Take-Profit Order', value: TradeHistoryAction.FailedTakeProfitOrder}, //16
    {label: 'Cancel Take-Profit Order', value: TradeHistoryAction.CancelTakeProfitOrder}, //17
  ],
  'Stop-loss orders': [
    {label: 'Create Stop-Loss Order', value: TradeHistoryAction.CreateStopLossOrder}, //18
    {label: 'Update Stop-Loss Order', value: TradeHistoryAction.UpdateStopLossOrder}, //19
    {label: 'Execute Stop-Loss Order', value: TradeHistoryAction.ExecuteStopLossOrder}, //20
    {label: 'Failed Stop-Loss Order', value: TradeHistoryAction.FailedStopLossOrder}, //21
    {label: 'Cancel Stop-Loss Order', value: TradeHistoryAction.CancelStopLossOrder}, //22
  ],
  'Market swaps': [
    {label: 'Request Market Swap', value: TradeHistoryAction.RequestMarketSwap}, //23
    {label: 'Execute Market Swap', value: TradeHistoryAction.ExecuteMarketSwap}, //24
    {label: 'Failed Market Swap', value: TradeHistoryAction.FailedMarketSwap}, //25
    {label: 'Cancel Market Swap', value: TradeHistoryAction.CancelMarketSwap}, //26
  ],
  'Limit swaps': [
    {label: 'Create Limit Swap', value: TradeHistoryAction.CreateLimitSwap}, //27
    {label: 'Update Limit Swap', value: TradeHistoryAction.UpdateLimitSwap}, //28
    {label: 'Execute Limit Swap', value: TradeHistoryAction.ExecuteLimitSwap}, //29
    {label: 'Failed Limit Swap', value: TradeHistoryAction.FailedLimitSwap}, //30
    {label: 'Cancel Limit Swap', value: TradeHistoryAction.CancelLimitSwap}, //31
  ],
  'Deposits': [
    {label: 'Request Deposit', value: TradeHistoryAction.RequestDeposit}, //32
    {label: 'Deposit', value: TradeHistoryAction.Deposit}, //33
    {label: 'Failed Deposit', value: TradeHistoryAction.FailedDeposit}, //34
    {label: 'Cancel Deposit', value: TradeHistoryAction.CancelDeposit}, //35
  ],
  'Withdraws': [
    {label: 'Request Withdraw', value: TradeHistoryAction.RequestWithdraw}, //36
    {label: 'Withdraw', value: TradeHistoryAction.Withdraw}, //37
    {label: 'Failed Withdraw', value: TradeHistoryAction.FailedWithdraw}, //38
    {label: 'Cancel Withdraw', value: TradeHistoryAction.CancelWithdraw}, //39
  ],
  'Liquidations': [{label: 'Liquidation', value: TradeHistoryAction.Liquidation}], //40
  'Position': [
    {label: 'Position Increase', value: TradeHistoryAction.PositionIncrease}, //41
    {label: 'Position Decrease', value: TradeHistoryAction.PositionDecrease}, //42
  ],
}

export default memo(function TradesTab() {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const marketsData = useMarketsData()

  const markets = useMemo(() => {
    return Array.from(marketsData?.values() ?? []).map(market => ({
      label: market.name,
      value: market.marketTokenAddress,
      indexTokenAddress: market.indexTokenAddress,
    }))
  }, [marketsData])

  const marketOptions = useMemo(() => {
    return {
      Direction: [
        {label: 'Long', value: true},
        {label: 'Short', value: false},
        {label: 'Swap', value: '--swap--'},
      ],
      Markets: markets,
    } as const
  }, [markets])

  function getActionLabel(value: TradeHistoryAction): string {
    for (const actions of Object.values(actionOptions)) {
      for (const action of actions) {
        if (action.value === value) {
          return action.label
        }
      }
    }
    return 'Unknown Action'
  }

  function getMarketLabel(address: string): string {
    const market = marketsData?.get(address)
    return market ? market.name : 'Unknown Market'
  }

  const formatUsd = useCallback((amount: string): string => {
    if (!amount) return '-'
    const amountBigNumberish = cairoIntToBigInt(amount)
    return formatNumber(shrinkDecimals(amountBigNumberish, USD_DECIMALS), Format.USD, {
      exactFractionDigits: true,
      fractionDigits: 2,
    })
  }, [])

  const formatMarketUsd = useCallback(
    (amount: string, marketAddress: string): string => {
      const market = marketsData?.get(marketAddress)
      if (!market) return '0'
      const indexTokenAddress = market.indexTokenAddress
      const decimals = tokensMetadata.get(indexTokenAddress)?.decimals
      if (!decimals) return '0'
      const amountBigNumberish = cairoIntToBigInt(amount)
      return formatNumber(shrinkDecimals(amountBigNumberish, USD_DECIMALS - decimals), Format.USD, {
        exactFractionDigits: true,
        fractionDigits: 2,
      })
    },
    [marketsData, tokensMetadata],
  )

  const formatLocaleDateTime = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }, [])

  const [selectedActions, setSelectedActions] = useState<TradeHistoryAction[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [selectedDirection, setSelectedDirection] = useState<boolean[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  // const [isLoading, setIsLoading] = useState<boolean>(false)

  console.log('Current Page:', currentPage)
  console.log('Selected actions:', selectedActions)
  console.log('Selected markets:', selectedMarkets)
  console.log('Selected direction:', selectedDirection)

  const {isLoading, data} = useTradeHistory(
    selectedActions,
    selectedMarkets,
    selectedDirection,
    currentPage,
    10,
    0,
  )

  const page = Array.isArray(data) ? 0 : data.page
  const totalPages = Array.isArray(data) ? 0 : data.totalPages

  console.log('Trade history:', data)

  const tradeHistoryItems = Array.isArray(data) ? [] : (data.data as TradeHistoryItem[])

  console.log('Trade history items:', tradeHistoryItems)

  const onActionChange = useCallback((action: SharedSelection) => {
    // TODO: validate action value with isSupportedAction instead of type assertion
    setSelectedActions(Array.from(action) as TradeHistoryAction[])
    // console.log('Selected actions:', Array.from(action))
  }, [])

  // const onMarketChange = useCallback((market: SharedSelection) => {
  //   setSelectedMarkets(Array.from(market) as string[])
  //   // console.log('Selected markets:', Array.from(market))
  // }, [])

  // const onDirectionChange = useCallback((isLong: SharedSelection) => {
  //   const booleanArray = Array.from(isLong).map(item => Boolean(item))
  //   setSelectedDirection(booleanArray)
  //   console.log('Selected direction:', booleanArray)
  // }, [])

  const handleSelectionChange = useCallback((selection: SharedSelection) => {
    const selectedMarkets: string[] = []
    const selectedDirections: boolean[] = []

    Array.from(selection).forEach(item => {
      const itemValue = item as string
      if (itemValue === 'true' || itemValue === 'false') {
        selectedDirections.push(itemValue === 'true')
      } else if (itemValue !== '--swap--') {
        selectedMarkets.push(itemValue)
      }
    })

    setSelectedMarkets(selectedMarkets)
    setSelectedDirection(selectedDirections)

    console.log('Selected markets:', selectedMarkets)
    console.log('Selected direction:', selectedDirections)
  }, [])

  const tableClassNames = useMemo(
    () => ({
      th: '!rounded-none',
    }),
    [],
  )

  const headingClasses = useMemo(
    () => 'flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small',
    [],
  )

  const selectSectionClassNames = useMemo(
    () => ({
      heading: headingClasses,
      base: 'last:mb-0',
    }),
    [headingClasses],
  )

  const selectClassNames = useMemo(
    () => ({
      base: 'w-max -mx-[0.6875rem] min-w-[100px]',
      mainWrapper: 'w-full',
      value: 'pr-6 truncate-none text-xs',
      label: 'text-xs',
    }),
    [],
  )

  const listboxItemClasses = useMemo(
    () => ({
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
    }),
    [],
  )

  const popoverClassNames = useMemo(
    () => ({
      base: 'rounded-large',
      content: 'p-1 bg-background min-w-max',
    }),
    [],
  )

  const listboxProps = useMemo(
    () => ({
      itemClasses: listboxItemClasses,
    }),
    [listboxItemClasses],
  )

  const popoverProps = useMemo(
    () => ({
      offset: 10,
      classNames: popoverClassNames,
    }),
    [popoverClassNames],
  )

  const scrollShadowProps = useMemo(
    () => ({
      isEnabled: false,
    }),
    [],
  )

  return (
    <>
      <Table className='mt-2' aria-label='Trade History Table' classNames={tableClassNames}>
        <TableHeader>
          <TableColumn>
            <Select
              classNames={selectClassNames}
              label={t('Action')}
              selectionMode='multiple'
              onSelectionChange={onActionChange}
              listboxProps={listboxProps}
              popoverProps={popoverProps}
              scrollShadowProps={scrollShadowProps}
              items={Array.from(Object.entries(actionOptions))}
            >
              {([category, actions]) => (
                <SelectSection key={category} title={category} classNames={selectSectionClassNames}>
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
              classNames={selectClassNames}
              label={t('Market')}
              selectionMode='multiple'
              onSelectionChange={handleSelectionChange}
              listboxProps={listboxProps}
              popoverProps={popoverProps}
              scrollShadowProps={scrollShadowProps}
              items={Array.from(Object.entries(marketOptions))}
            >
              {([category, markets]) => (
                <SelectSection key={category} title={category} classNames={selectSectionClassNames}>
                  {markets.map(action => (
                    <SelectItem
                      key={String(action.value)}
                      value={String(action.value)}
                      className='text-nowrap'
                    >
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectSection>
              )}
            </Select>
          </TableColumn>
          <TableColumn>{t('Size')}</TableColumn>
          <TableColumn>{t('Price')}</TableColumn>
          <TableColumn>{t('RPnL')}</TableColumn>
          <TableColumn>{t('Fee')}</TableColumn>
          <TableColumn>{t('Time')}</TableColumn>
        </TableHeader>
        <TableBody
          items={tradeHistoryItems}
          emptyContent={'No trade.'}
          isLoading={isLoading}
          loadingContent={<Spinner />}
        >
          {tradeHistoryItems.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <div
                  className={`!absolute left-[-1rem] top-[10%] h-4/5 w-1 ${
                    item.action === TradeHistoryAction.MarketIncrease ||
                    item.action === TradeHistoryAction.RequestMarketIncrease ||
                    item.action === TradeHistoryAction.FailedMarketIncrease ||
                    item.action === TradeHistoryAction.CancelMarketIncrease ||
                    item.action === TradeHistoryAction.PositionIncrease
                      ? 'bg-green-500'
                      : item.action === TradeHistoryAction.MarketDecrease ||
                          item.action === TradeHistoryAction.RequestMarketDecrease ||
                          item.action === TradeHistoryAction.FailedMarketDecrease ||
                          item.action === TradeHistoryAction.CancelMarketDecrease ||
                          item.action === TradeHistoryAction.PositionDecrease
                        ? 'bg-red-500'
                        : item.isLong
                          ? 'bg-green-500'
                          : 'bg-red-500'
                  }`}
                />
                {getActionLabel(item.action)}
              </TableCell>
              <TableCell>{getMarketLabel(item.market)}</TableCell>
              <TableCell>{formatUsd(item.size)}</TableCell>
              <TableCell>{formatMarketUsd(item.price, item.market)}</TableCell>
              <TableCell>{formatUsd(item.rpnl)}</TableCell>
              <TableCell>{formatUsd(item.fee)}</TableCell>
              <TableCell>{formatLocaleDateTime(item.createdAt * 1000)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className='mt-4 flex justify-center'>
        <Pagination
          showControls
          total={totalPages}
          initialPage={page}
          page={page}
          onChange={setCurrentPage}
        />
      </div>
    </>
  )
})
