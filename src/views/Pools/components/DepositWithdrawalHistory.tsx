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
} from '@heroui/react'
import {create} from 'mutative'

import useChainId from '@/lib/starknet/hooks/useChainId'
import getScanUrl, {ScanType} from '@/lib/starknet/utils/getScanUrl'
import useDepositWithdrawalHistory from '@/lib/trade/hooks/useDepositWithdrawalHistory'
import useFeeToken from '@/lib/trade/hooks/useFeeToken'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import {TradeHistoryAction} from '@/lib/trade/services/fetchTradeHistories'
import getMarketPoolName from '@/lib/trade/utils/market/getMarketPoolName'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import * as m from '@/paraglide/messages'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

const actionOptions = {
  Deposits: [
    {label: 'Request Deposit', value: TradeHistoryAction.RequestDeposit},
    {label: 'Deposit', value: TradeHistoryAction.Deposit},
    {label: 'Failed Deposit', value: TradeHistoryAction.FailedDeposit},
    {label: 'Cancel Deposit', value: TradeHistoryAction.CancelDeposit},
  ],
  Withdrawals: [
    {label: 'Request Withdraw', value: TradeHistoryAction.RequestWithdraw},
    {label: 'Withdraw', value: TradeHistoryAction.Withdraw},
    {label: 'Failed Withdraw', value: TradeHistoryAction.FailedWithdraw},
    {label: 'Cancel Withdraw', value: TradeHistoryAction.CancelWithdraw},
  ],
} as const

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

const formatLocaleDateTime = (timestamp: number): string => {
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

export default memo(function DepositWithdrawalHistory() {
  const [chainId] = useChainId()
  const {data: marketsData = new Map()} = useMarketsData()
  const {data: marketTokensData = new Map()} = useMarketTokensData()
  const {feeToken, feeTokenPrice} = useFeeToken()

  const markets = useMemo(() => {
    return Array.from(marketsData.values()).map(market => ({
      label: market.name,
      value: market.marketTokenAddress,
    }))
  }, [marketsData])

  const [selectedActions, setSelectedActions] = useState<TradeHistoryAction[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)

  // GET DEPOSIT/WITHDRAWAL HISTORY
  const {
    data: history,
    refetch,
    isLoading,
    isFetching,
  } = useDepositWithdrawalHistory(selectedActions, selectedMarkets, currentPage, 10)
  const totalPages = history?.totalPages ?? 0
  const historyItems = useMemo(() => history?.data ?? [], [history])

  const shortlistedTokenAddresses = useMemo(() => {
    return new Set(
      historyItems.flatMap(item => {
        const market = marketsData.get(item.market)
        if (!market) return [item.market]
        return [item.market, market.longToken.address, market.shortToken.address]
      }),
    )
  }, [historyItems, marketsData])

  const {data: shortlistedTokenPrices = new Map()} = useTokenPrices(
    useCallback(
      prices => {
        if (shortlistedTokenAddresses.size === 0) return new Map() as TokenPricesData

        return create(prices, draft => {
          draft.forEach((_, key) => {
            if (!shortlistedTokenAddresses.has(key)) {
              draft.delete(key)
            }
          })
        })
      },
      [shortlistedTokenAddresses],
    ),
  )

  const refetchHistory = useCallback(() => {
    void refetch()
  }, [refetch])

  // HANDLE ACTION CHANGE
  const onActionChange = useCallback((action: SharedSelection) => {
    setSelectedActions(Array.from(action) as TradeHistoryAction[])
  }, [])

  // HANDLE MARKET CHANGE
  const onMarketChange = useCallback((selection: SharedSelection) => {
    setSelectedMarkets(Array.from(selection) as string[])
  }, [])

  const extendedHistoryItems = useMemo(() => {
    return historyItems
      .map(item => {
        const market = marketsData.get(item.market)
        const marketTokenData = marketTokensData.get(item.market)

        if (!market) return false

        const marketTokenAmount = item.marketTokenAmount
          ? shrinkDecimals(item.marketTokenAmount, marketTokenData?.decimals ?? 0)
          : '0'

        const marketTokenPrice = shortlistedTokenPrices.get(market.marketTokenAddress)
        const marketTokenFractionDigits = calculateTokenFractionDigits(marketTokenPrice?.max)

        const marketTokenAmountText = formatNumber(marketTokenAmount, Format.READABLE, {
          fractionDigits: marketTokenFractionDigits,
        })

        const longTokenAmount = item.longTokenAmount
          ? shrinkDecimals(item.longTokenAmount, market.longToken.decimals)
          : '0'

        const longTokenPrice = shortlistedTokenPrices.get(market.longToken.address)
        const longTokenFractionDigits = calculateTokenFractionDigits(longTokenPrice?.max)

        const longTokenAmountText = formatNumber(longTokenAmount, Format.READABLE, {
          fractionDigits: longTokenFractionDigits,
        })

        const shortTokenAmount = item.shortTokenAmount
          ? shrinkDecimals(item.shortTokenAmount, market.shortToken.decimals)
          : '0'

        const shortTokenPrice = shortlistedTokenPrices.get(market.shortToken.address)

        const shortTokenFractionDigits = calculateTokenFractionDigits(shortTokenPrice?.max)

        const shortTokenAmountText = formatNumber(shortTokenAmount, Format.READABLE, {
          fractionDigits: shortTokenFractionDigits,
        })

        const executionFee = item.executionFee
          ? shrinkDecimals(item.executionFee, feeToken.decimals)
          : '0'

        const executionFeeText = `${formatNumber(executionFee, Format.READABLE, {
          fractionDigits: 6,
        })} ${feeToken.symbol}`

        const executionFeeUsd = shrinkDecimals(
          expandDecimals(executionFee, feeToken.decimals) * BigInt(feeTokenPrice.max),
          USD_DECIMALS + feeToken.decimals,
        )

        const executionFeeUsdText = formatNumber(executionFeeUsd, Format.USD)

        const txnUrl = getScanUrl(chainId, ScanType.Transaction, item.txHash)

        return {
          ...item,
          market,
          marketTokenAmountText,
          longTokenAmountText,
          shortTokenAmountText,
          executionFeeUsdText,
          executionFeeText,
          txnUrl,
        }
      })
      .filter(Boolean)
  }, [
    chainId,
    feeToken.decimals,
    feeToken.symbol,
    feeTokenPrice.max,
    historyItems,
    marketTokensData,
    marketsData,
    shortlistedTokenPrices,
  ])

  return (
    <>
      <h2 className='mt-4 text-lg font-bold text-default-900'>Deposit/Withdrawal History</h2>
      <div className='relative mt-4'>
        <Button
          className='absolute right-2 top-2 z-10'
          size='md'
          variant='solid'
          isIconOnly
          isLoading={isFetching}
          onPress={refetchHistory}
        >
          <Icon icon='mdi:refresh' />
        </Button>
        <Table
          className='mt-2'
          aria-label='Deposit/Withdrawal History Table'
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
                onSelectionChange={onMarketChange}
                listboxProps={LIST_BOX_PROPS}
                popoverProps={POPOVER_PROPS}
                scrollShadowProps={SCROLL_SHADOW_PROPS}
              >
                {markets.map(market => (
                  <SelectItem key={market.value} className='text-nowrap'>
                    {market.label}
                  </SelectItem>
                ))}
              </Select>
            </TableColumn>
            <TableColumn>{m.calm_blue_weasel_cry()}</TableColumn>
            <TableColumn>{m.livid_polite_jackdaw_propel()}</TableColumn>
            <TableColumn>{m.whole_plain_mantis_affirm()}</TableColumn>
            <TableColumn>{m.sad_factual_hare_mop()}</TableColumn>
            <TableColumn>{m.jumpy_round_koala_radiate()}</TableColumn>
          </TableHeader>
          <TableBody
            items={extendedHistoryItems}
            emptyContent={'No deposit/withdrawal history.'}
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
                          item.action === TradeHistoryAction.RequestDeposit ||
                          item.action === TradeHistoryAction.Deposit ||
                          item.action === TradeHistoryAction.FailedDeposit ||
                          item.action === TradeHistoryAction.CancelDeposit
                        ) {
                          return 'bg-green-500'
                        }
                        return 'bg-red-500'
                      })()}`}
                    />
                    {getActionLabel(item.action)}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <img
                        src={item.market.indexToken.imageUrl}
                        alt={item.market.indexToken.symbol}
                        className='size-6 rounded'
                      />
                      <div className='flex flex-col'>
                        <div>{item.market.indexToken.symbol}</div>
                        <div className='whitespace-nowrap text-xs opacity-50'>
                          {getMarketPoolName(item.market)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.marketTokenAmountText} WM</TableCell>
                  <TableCell>
                    {item.longTokenAmountText} {item.market.longToken.symbol}
                  </TableCell>
                  <TableCell>
                    {item.shortTokenAmountText} {item.market.shortToken.symbol}
                  </TableCell>
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
    </>
  )
})
