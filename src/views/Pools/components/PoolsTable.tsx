import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import type {SortDescriptor} from '@react-types/shared'
import {matchSorter} from 'match-sorter'
import {create} from 'mutative'

import {getTokenMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsDataQuery from '@/lib/trade/hooks/useMarketsDataQuery'
import useMarketTokenBalancesQuery from '@/lib/trade/hooks/useMarketTokenBalancesQuery'
import useMarketTokensDataQuery from '@/lib/trade/hooks/useMarketTokensDataQuery'
import useTokenPricesQuery from '@/lib/trade/hooks/useTokenPricesQuery'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import calculateMarketPrice from '@/lib/trade/utils/market/calculateMarketPrice'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import {logError} from '@/utils/logger'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import markAsMemoized from '@/utils/react/markAsMemoized'

import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

const columns = [
  {name: 'MARKET', uid: 'market', sortable: true},
  {name: 'PRICE', uid: 'price', sortable: true},
  {name: 'TOTAL SUPPLY', uid: 'totalSupply', sortable: true},
  // {name: 'VALUE', uid: 'value', sortable: true},
  {name: 'WALLET BALANCE', uid: 'balance', sortable: true},
  {name: 'APY', uid: 'apy', sortable: true},
  {name: 'ACTIONS', uid: 'actions'},
]

export interface ExtendedMarketData {
  imageUrl: string
  marketTokenAddress: string
  market: string
  price: number
  priceString: string
  totalSupply: number
  totalSupplyString: string
  value: number
  valueString: string
  balance: number
  balanceString: string
  balanceValue: number
  balanceValueString: string
  apy: string
  actions?: ReactNode
}

const TABLE_CLASS_NAMES = {th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider']}

const selectMarketTokenAddresses = markAsMemoized((data: MarketsData) => Array.from(data.values()))

export default memo(function PoolsTable() {
  const [filterValue, setFilterValue] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [selectedMarketAddress, setSelectedMarketAddress] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [chainId] = useChainId()

  const {
    data: marketsData = [],
    isLoading: isMarketsDataLoading,
    isFetching: isMarketsDataFetching,
    refetch: refetchMarketsData,
  } = useMarketsDataQuery(selectMarketTokenAddresses)
  const {
    data: marketTokensData = new Map(),
    isLoading: isMarketTokensDataLoading,
    isFetching: isMarketTokensDataFetching,
    refetch: refetchMarketTokensData,
  } = useMarketTokensDataQuery()
  const {
    data: marketTokensBalances = new Map(),
    isLoading: isMarketTokensBalancesLoading,
    isFetching: isMarketTokensBalancesFetching,
    refetch: refetchMarketTokensBalances,
  } = useMarketTokenBalancesQuery()

  const refetchPools = useCallback(() => {
    void refetchMarketsData()
    void refetchMarketTokensData()
    void refetchMarketTokensBalances()
  }, [refetchMarketsData, refetchMarketTokensData, refetchMarketTokensBalances])

  const poolsIsLoading = useMemo(
    () => isMarketsDataLoading || isMarketTokensDataLoading || isMarketTokensBalancesLoading,
    [isMarketsDataLoading, isMarketTokensDataLoading, isMarketTokensBalancesLoading],
  )

  const poolsIsFetching = useMemo(() => {
    return isMarketsDataFetching || isMarketTokensDataFetching || isMarketTokensBalancesFetching
  }, [isMarketsDataFetching, isMarketTokensDataFetching, isMarketTokensBalancesFetching])

  const filteredMarkets = useMemo(
    () => (filterValue ? matchSorter(marketsData, filterValue, {keys: ['name']}) : marketsData),
    [marketsData, filterValue],
  )

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: shortlistedTokenPrices = new Map()} = useTokenPricesQuery(
    useCallback(
      prices => {
        if (filteredMarkets.length === 0) return new Map() as TokenPricesData
        const tokenAddresses = new Set<string>()
        filteredMarkets.forEach(market => {
          tokenAddresses.add(market.longToken.address)
          tokenAddresses.add(market.shortToken.address)
        })

        return create(prices, draft => {
          draft.forEach((_, key) => {
            if (!tokenAddresses.has(key)) {
              draft.delete(key)
            }
          })
        })
      },
      [filteredMarkets],
    ),
  )

  const extendedMarkets = useMemo(() => {
    return filteredMarkets
      .map(market => {
        try {
          const marketTokenData = marketTokensData.get(market.marketTokenAddress)

          if (!marketTokenData) return null

          const indexTokenData = getTokenMetadata(chainId, market.indexTokenAddress)

          const balance = marketTokensBalances.get(market.marketTokenAddress) ?? 0n

          const longTokenPrice = shortlistedTokenPrices.get(market.longToken.address) ?? {
            min: 0n,
            max: 0n,
          }
          const shortTokenPrice = shortlistedTokenPrices.get(market.shortToken.address) ?? {
            min: 0n,
            max: 0n,
          }
          const price = calculateMarketPrice(
            market,
            marketTokenData,
            longTokenPrice,
            shortTokenPrice,
          ).max
          const tokenFractionDigits = calculateTokenFractionDigits(price)

          const priceString = formatNumber(shrinkDecimals(price, USD_DECIMALS), Format.USD, {
            exactFractionDigits: true,
            fractionDigits: 3,
          })
          const priceNumber = Number(shrinkDecimals(price, USD_DECIMALS))

          const valueString = formatNumber(
            shrinkDecimals(
              marketTokenData.totalSupply * price,
              marketTokenData.decimals + USD_DECIMALS,
            ),
            Format.USD,
            {fractionDigits: 0},
          )

          const valueNumber = Number(
            shrinkDecimals(
              marketTokenData.totalSupply * price,
              marketTokenData.decimals + USD_DECIMALS,
            ),
          )

          const balanceString = formatNumber(
            shrinkDecimals(balance, marketTokenData.decimals),
            Format.READABLE,
            {fractionDigits: tokenFractionDigits},
          )

          const balanceNumber = Number(shrinkDecimals(balance, marketTokenData.decimals))

          const balanceValueString = formatNumber(
            shrinkDecimals(balance * price, marketTokenData.decimals + USD_DECIMALS),
            Format.READABLE,
            {fractionDigits: 2, exactFractionDigits: true},
          )

          const balanceValueNumber = Number(
            shrinkDecimals(balance * price, marketTokenData.decimals + USD_DECIMALS),
          )

          const totalSupplyString = formatNumber(
            shrinkDecimals(marketTokenData.totalSupply, marketTokenData.decimals),
            Format.READABLE,
            {fractionDigits: 0, exactFractionDigits: true},
          )

          const totalSupplyNumber = Number(
            shrinkDecimals(marketTokenData.totalSupply, marketTokenData.decimals),
          )

          return {
            imageUrl: indexTokenData.imageUrl,
            marketTokenAddress: market.marketTokenAddress,
            market: market.name,
            price: priceNumber,
            priceString,
            totalSupply: totalSupplyNumber,
            totalSupplyString,
            value: valueNumber,
            valueString,
            balance: balanceNumber,
            balanceString,
            balanceValue: balanceValueNumber,
            balanceValueString,
            apy: '--',
          }
        } catch (error) {
          logError(error)
          return null
        }
      })
      .filter((market): market is ExtendedMarketData => market !== null)
  }, [marketTokensData, filteredMarkets, chainId, marketTokensBalances, shortlistedTokenPrices])

  const sortedMarkets = useMemo(() => {
    const {column, direction} = sortDescriptor ?? {}
    if (!column) return extendedMarkets

    return extendedMarkets.sort((a, b) => {
      const aValue = a[column as keyof ExtendedMarketData]
      const bValue = b[column as keyof ExtendedMarketData]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })
  }, [extendedMarkets, sortDescriptor])

  const handleOpenModal = useCallback((marketTokenAddress: string, action: 'buy' | 'sell') => {
    setSelectedMarketAddress(marketTokenAddress)
    setOrderType(action)
    setIsModalOpen(true)
  }, [])

  const latestHandleOpenModal = useLatest(handleOpenModal)

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMarketAddress(null)
  }, [])

  const renderCell = useCallback((market: ExtendedMarketData, columnKey: React.Key) => {
    const key = String(columnKey) as keyof ExtendedMarketData

    if (['market'].includes(key)) {
      return (
        <div className='flex items-center gap-2'>
          <img src={market.imageUrl} alt={market.market} className='size-6' />
          <span className='text-nowrap'>{market.market}</span>
        </div>
      )
    }

    if (['price'].includes(key)) {
      return <span className='text-nowrap'>{market.priceString}</span>
    }

    if (['totalSupply'].includes(key)) {
      return (
        <>
          <div className='text-nowrap'>{market.totalSupplyString} WM</div>
          <div className='text-nowrap text-xs opacity-50'>{market.valueString}</div>
        </>
      )
    }

    if (['balance'].includes(key)) {
      return (
        <>
          <div className='text-nowrap'>{market.balanceString} WM</div>
          <div className='text-nowrap text-xs opacity-50'>${market.balanceValueString}</div>
        </>
      )
    }

    if (key === 'actions') {
      return (
        <div className='flex gap-2'>
          <Button
            size='sm'
            color='success'
            onPress={() => {
              latestHandleOpenModal.current(market.marketTokenAddress, 'buy')
            }}
          >
            Buy
          </Button>
          <Button
            size='sm'
            color='danger'
            onPress={() => {
              latestHandleOpenModal.current(market.marketTokenAddress, 'sell')
            }}
          >
            Sell
          </Button>
        </div>
      )
    }

    return <>{market[key]}</>
  }, [])

  const onSearchChange = useCallback((value: string) => {
    setFilterValue(value)
  }, [])

  const onSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex items-end justify-between gap-3'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            name='market-search'
            placeholder='Search by market name...'
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-small text-default-400'>Total {sortedMarkets.length} markets</span>
        </div>
      </div>
    )
  }, [filterValue, onSearchChange, sortedMarkets.length, onClear])

  return (
    <div className='relative'>
      <Button
        className='absolute -right-2 top-20 z-10'
        size='md'
        variant='solid'
        isIconOnly
        isLoading={poolsIsFetching}
        onPress={refetchPools}
      >
        <Icon icon='mdi:refresh' />
      </Button>
      <Table
        aria-label='Markets table'
        classNames={TABLE_CLASS_NAMES}
        {...(sortDescriptor ? {sortDescriptor} : {})}
        onSortChange={onSortChange}
        topContent={topContent}
        topContentPlacement='outside'
      >
        <TableHeader columns={columns}>
          {column => (
            <TableColumn key={column.uid} allowsSorting={column.sortable ?? false}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'No markets.'}
          items={sortedMarkets}
          isLoading={poolsIsLoading}
          loadingContent={<Spinner className='mt-4' />}
        >
          {item => (
            <TableRow key={item.marketTokenAddress}>
              {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {selectedMarketAddress && orderType === 'buy' && (
        <DepositModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          marketTokenAddress={selectedMarketAddress}
          orderType={orderType}
        />
      )}
      {selectedMarketAddress && orderType === 'sell' && (
        <WithdrawModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          marketTokenAddress={selectedMarketAddress}
        />
      )}
    </div>
  )
})
