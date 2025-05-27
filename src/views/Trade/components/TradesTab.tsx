import {
  Button,
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
  Tooltip,
} from '@heroui/react'
import {cairoIntToBigInt} from 'wolfy-sdk'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useFeeToken from '@/lib/trade/hooks/useFeeToken'
import useMarketsDataQuery from '@/lib/trade/hooks/useMarketsDataQuery'
import useTradeHistoryQuery from '@/lib/trade/hooks/useTradeHistoryQuery'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'
import {useSetTokenAddress} from '@/lib/trade/states/useTokenAddress'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import * as m from '@/paraglide/messages'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

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
  // 'Deposits': [
  //   {label: 'Request Deposit', value: TradeHistoryAction.RequestDeposit}, //32
  //   {label: 'Deposit', value: TradeHistoryAction.Deposit}, //33
  //   {label: 'Failed Deposit', value: TradeHistoryAction.FailedDeposit}, //34
  //   {label: 'Cancel Deposit', value: TradeHistoryAction.CancelDeposit}, //35
  // ],
  // 'Withdraws': [
  //   {label: 'Request Withdraw', value: TradeHistoryAction.RequestWithdraw}, //36
  //   {label: 'Withdraw', value: TradeHistoryAction.Withdraw}, //37
  //   {label: 'Failed Withdraw', value: TradeHistoryAction.FailedWithdraw}, //38
  //   {label: 'Cancel Withdraw', value: TradeHistoryAction.CancelWithdraw}, //39
  // ],
  'Liquidations': [{label: 'Liquidation', value: TradeHistoryAction.Liquidation}], //40
  'Position': [
    {label: 'Position Increase', value: TradeHistoryAction.PositionIncrease}, //41
    {label: 'Position Decrease', value: TradeHistoryAction.PositionDecrease}, //42
  ],
}

const SELECT_SECTION_CLASS_NAMES = {
  heading: 'flex w-full sticky top-1 z-20 py-1.5 px-2 bg-default-100 shadow-small rounded-small',
  base: 'last:mb-0',
}

const SELECT_CLASS_NAMES = {
  base: 'w-max -mx-[0.6875rem] min-w-[100px]',
  mainWrapper: 'w-full',
  value: 'pr-6 truncate-none text-xs',
  label: 'text-xs',
}

const LIST_BOX_PROPS = {
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
  isVirtualized: false,
}

const POPOVER_PROPS = {
  offset: 10,
  classNames: {base: 'rounded-large', content: 'p-1 bg-background min-w-max'},
}

const SCROLL_SHADOW_PROPS = {isEnabled: false}

export const formatLocaleDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

const getActionLabel = (value: TradeHistoryAction): string => {
  for (const actions of Object.values(actionOptions)) {
    for (const action of actions) {
      if (action.value === value) {
        return action.label
      }
    }
  }
  return 'Unknown Action'
}

const formatUsd = (amount: string | null): string => {
  if (amount === null) return '-'
  const amountBigNumberish = cairoIntToBigInt(amount)
  return formatNumber(shrinkDecimals(amountBigNumberish, USD_DECIMALS), Format.USD, {
    exactFractionDigits: true,
    fractionDigits: 2,
  })
}

export default memo(function TradesTab() {
  const [chainId] = useChainId()
  const tokensMetadata = getTokensMetadata(chainId)
  const {data: marketsData = new Map()} = useMarketsDataQuery()
  const setTokenAddress = useSetTokenAddress()
  const {feeToken, feeTokenPrice} = useFeeToken()

  const markets = useMemo(() => {
    return Array.from(marketsData.values()).map(market => ({
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

  // FORMAT MARKET USD
  const formatMarketUsd = useCallback(
    (amount: string, marketAddress: string): string => {
      const market = marketsData.get(marketAddress)
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

  const [selectedActions, setSelectedActions] = useState<TradeHistoryAction[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [selectedDirection, setSelectedDirection] = useState<boolean[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)

  // GET TRADE HISTORY
  const {
    data: tradeHistory,
    refetch,
    isLoading,
    isFetching,
  } = useTradeHistoryQuery(selectedActions, selectedMarkets, selectedDirection, currentPage, 10)
  const totalPages = tradeHistory?.totalPages ?? 0
  const tradeHistoryItems = useMemo(() => tradeHistory?.data ?? [], [tradeHistory?.data])

  const refetchTradeHistory = useCallback(() => {
    void refetch()
  }, [refetch])

  // HANDLE ACTION CHANGE
  const onActionChange = useCallback((action: SharedSelection) => {
    setSelectedActions(Array.from(action) as TradeHistoryAction[])
  }, [])

  // HANDLE MARKET AND DIRECTION CHANGE
  const handleMarketAndDirectionChange = useCallback((selection: SharedSelection) => {
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
  }, [])

  const extendedTradeHistoryItems = useMemo(() => {
    return tradeHistoryItems
      .map(item => {
        const market = marketsData.get(item.market)
        if (!market) return false

        const poolName = getMarketPoolName(market)

        const executionFee = item.fee ? shrinkDecimals(item.fee, feeToken.decimals) : '0'

        const executionFeeText = `${formatNumber(executionFee, Format.READABLE, {
          fractionDigits: 6,
        })} ${feeToken.symbol}`

        const executionFeeUsd = shrinkDecimals(
          expandDecimals(executionFee, feeToken.decimals) * BigInt(feeTokenPrice.max),
          USD_DECIMALS + feeToken.decimals,
        )

        const executionFeeUsdText = formatNumber(executionFeeUsd, Format.USD)

        const txnUrl = getScanUrl(chainId, ScanType.Transaction, item.txHash)

        return {...item, market, poolName, executionFeeText, executionFeeUsdText, txnUrl}
      })
      .filter(Boolean)
  }, [
    chainId,
    feeToken.decimals,
    feeToken.symbol,
    feeTokenPrice.max,
    marketsData,
    tradeHistoryItems,
  ])

  return (
    <div className='relative'>
      <Button
        className='absolute right-2 top-2 z-10'
        size='md'
        variant='solid'
        isIconOnly
        isLoading={isFetching}
        onPress={refetchTradeHistory}
      >
        <Icon icon='mdi:refresh' />
      </Button>
      <Table
        className='mt-2'
        aria-label='Trade History Table'
        classNames={{th: '!rounded-none font-serif'}}
      >
        <TableHeader>
          <TableColumn>
            <Select
              classNames={SELECT_CLASS_NAMES}
              label={m.fancy_full_pigeon_cherish()}
              selectionMode='multiple'
              onSelectionChange={onActionChange}
              listboxProps={LIST_BOX_PROPS}
              popoverProps={POPOVER_PROPS}
              scrollShadowProps={SCROLL_SHADOW_PROPS}
              items={Array.from(Object.entries(actionOptions))}
            >
              {([category, actions]) => (
                <SelectSection
                  key={category}
                  title={category}
                  classNames={SELECT_SECTION_CLASS_NAMES}
                >
                  {actions.map(action => (
                    <SelectItem key={action.value} className='text-nowrap'>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectSection>
              )}
            </Select>
          </TableColumn>
          <TableColumn>
            <Select
              classNames={SELECT_CLASS_NAMES}
              label={m.plain_heroic_turtle_quell()}
              selectionMode='multiple'
              onSelectionChange={handleMarketAndDirectionChange}
              listboxProps={LIST_BOX_PROPS}
              popoverProps={POPOVER_PROPS}
              scrollShadowProps={SCROLL_SHADOW_PROPS}
              items={Array.from(Object.entries(marketOptions))}
            >
              {([category, markets]) => (
                <SelectSection
                  key={category}
                  title={category}
                  classNames={SELECT_SECTION_CLASS_NAMES}
                >
                  {markets.map(action => (
                    <SelectItem key={String(action.value)} className='text-nowrap'>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectSection>
              )}
            </Select>
          </TableColumn>
          <TableColumn>{m.safe_swift_mammoth_relish()}</TableColumn>
          <TableColumn>{m.light_factual_slug_walk()}</TableColumn>
          <TableColumn>{m.civil_known_lizard_cry()}</TableColumn>
          <TableColumn>{m.watery_proud_bird_attend()}</TableColumn>
          <TableColumn>{m.kind_crazy_grebe_praise()}</TableColumn>
        </TableHeader>
        <TableBody
          items={extendedTradeHistoryItems}
          emptyContent={'No trade.'}
          isLoading={isLoading}
          loadingContent={<Spinner className='mt-4' />}
        >
          {item => {
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div
                    className={`!absolute -left-4 top-[10%] h-4/5 w-1 ${(() => {
                      if (
                        item.action === TradeHistoryAction.MarketIncrease ||
                        item.action === TradeHistoryAction.RequestMarketIncrease ||
                        item.action === TradeHistoryAction.FailedMarketIncrease ||
                        item.action === TradeHistoryAction.CancelMarketIncrease ||
                        item.action === TradeHistoryAction.PositionIncrease
                      ) {
                        return 'bg-green-500'
                      }

                      if (
                        item.action === TradeHistoryAction.MarketDecrease ||
                        item.action === TradeHistoryAction.RequestMarketDecrease ||
                        item.action === TradeHistoryAction.FailedMarketDecrease ||
                        item.action === TradeHistoryAction.CancelMarketDecrease ||
                        item.action === TradeHistoryAction.PositionDecrease
                      ) {
                        return 'bg-red-500'
                      }

                      return item.isLong ? 'bg-green-500' : 'bg-red-500'
                    })()}`}
                  />
                  {getActionLabel(item.action)}
                </TableCell>
                <TableCell>
                  <Tooltip content='Press to switch market' showArrow>
                    <Button
                      disableRipple
                      disableAnimation
                      variant='light'
                      className='inline-flex min-w-max items-center justify-center gap-2 whitespace-nowrap rounded-none bg-transparent px-0 text-sm !transition-none tap-highlight-transparent hover:bg-transparent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[hover=true]:bg-transparent'
                      onPress={() => {
                        setTokenAddress(item.market.indexTokenAddress)
                      }}
                    >
                      <img
                        src={item.market.indexToken.imageUrl}
                        alt={item.market.indexToken.symbol}
                        className='size-6 rounded'
                      />
                      <div className='flex flex-col'>
                        <div>
                          {item.isLong ? 'Long' : 'Short'} {item.market.indexToken.symbol}
                        </div>
                        <div className='whitespace-nowrap text-xs opacity-50'>
                          [{item.poolName}]
                        </div>
                      </div>
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatUsd(item.size)}</TableCell>
                <TableCell>{formatMarketUsd(item.price, item.market.marketTokenAddress)}</TableCell>
                <TableCell>{formatUsd(item.rpnl)}</TableCell>
                <TableCell>
                  <div>{item.executionFeeUsdText}</div>
                  <div className='whitespace-nowrap text-xs opacity-50'>
                    {item.executionFeeText}
                  </div>
                </TableCell>
                <TableCell>
                  <a href={item.txnUrl} target='_blank' rel='noopener noreferrer'>
                    {formatLocaleDateTime(item.createdAt * 1000)
                      .split(', ')
                      .map(time => (
                        <div key={time}>{time}</div>
                      ))}
                  </a>
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className='mt-4 flex justify-center'>
          <Pagination
            showControls
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
})
