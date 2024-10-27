import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import type {SortDescriptor} from '@react-types/shared'
import React, {useCallback, useMemo, useState} from 'react'

import {getTokenMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useMarketTokenBalances from '@/lib/trade/hooks/useMarketTokenBalances'
import useMarketTokensData from '@/lib/trade/hooks/useMarketTokensData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import {logError} from '@/utils/logger'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

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
  actions?: React.ReactNode
}

export function calculateMarketPrice(
  market: MarketData,
  marketTokenData: MarketTokenData,
  tokenPrices: TokenPricesData | undefined,
) {
  if (!tokenPrices) return 0n

  const longTokenPrice = tokenPrices.get(market.longTokenAddress)?.max ?? 0n
  const shortTokenPrice = tokenPrices.get(market.shortTokenAddress)?.max ?? 0n

  const longTokenValue = convertTokenAmountToUsd(
    market.longPoolAmount,
    market.longToken.decimals,
    longTokenPrice,
  )
  const shortTokenValue = convertTokenAmountToUsd(
    market.shortPoolAmount,
    market.shortToken.decimals,
    shortTokenPrice,
  )

  // TODO: check why netPnlMax is not right
  const pendingPnl = market.netPnlMax

  const totalValue = longTokenValue + shortTokenValue - pendingPnl
  const totalSupply = marketTokenData.totalSupply

  return totalSupply > 0n ? expandDecimals(totalValue, marketTokenData.decimals) / totalSupply : 0n
}

export default function PoolsTable() {
  const [filterValue, setFilterValue] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({})
  const [selectedMarketAddress, setSelectedMarketAddress] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [chainId] = useChainId()

  const marketsData = useMarketsData()
  const tokenPrices = useTokenPrices(data => data)
  const marketTokensData = useMarketTokensData()
  const marketTokensBalances = useMarketTokenBalances()

  const extendedMarkets = useMemo(() => {
    if (!marketsData || !marketTokensData) return []
    return Array.from(marketsData.values())
      .map(market => {
        try {
          const marketTokenData = marketTokensData.get(market.marketTokenAddress)

          if (!marketTokenData) return null

          const indexTokenData = getTokenMetadata(chainId, market.indexTokenAddress)

          const balance = marketTokensBalances?.get(market.marketTokenAddress) ?? 0n

          // const price = market.priceMax

          const price =
            calculateMarketPrice(market, marketTokenData, tokenPrices) ||
            expandDecimals(1, USD_DECIMALS)

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
            {
              fractionDigits: 0,
            },
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
            {
              fractionDigits: tokenFractionDigits,
            },
          )

          const balanceNumber = Number(shrinkDecimals(balance, marketTokenData.decimals))

          const balanceValueString = formatNumber(
            shrinkDecimals(balance * price, marketTokenData.decimals + USD_DECIMALS),
            Format.READABLE,
            {
              fractionDigits: 2,
              exactFractionDigits: true,
            },
          )

          const balanceValueNumber = Number(
            shrinkDecimals(balance * price, marketTokenData.decimals + USD_DECIMALS),
          )

          const totalSupplyString = formatNumber(
            shrinkDecimals(marketTokenData.totalSupply, marketTokenData.decimals),
            Format.READABLE,
            {
              fractionDigits: 0,
              exactFractionDigits: true,
            },
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
  }, [marketsData, marketTokensData, tokenPrices, marketTokensBalances, chainId])

  const filteredMarkets = useMemo(() => {
    return extendedMarkets.filter(market =>
      market.market.toLowerCase().includes(filterValue.toLowerCase()),
    )
  }, [extendedMarkets, filterValue])

  const sortedMarkets = useMemo(() => {
    return [...filteredMarkets].sort((a, b) => {
      const {column, direction} = sortDescriptor
      if (!column) return 0

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
  }, [filteredMarkets, sortDescriptor])

  const handleOpenModal = useCallback((marketTokenAddress: string, action: 'buy' | 'sell') => {
    setSelectedMarketAddress(marketTokenAddress)
    setOrderType(action)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMarketAddress(null)
  }, [])

  const renderCell = useCallback(
    (market: ExtendedMarketData, columnKey: React.Key) => {
      const key = String(columnKey) as keyof ExtendedMarketData

      if (['market'].includes(key)) {
        return (
          <div className='flex items-center gap-2'>
            <img src={market.imageUrl} alt={market.market} className='h-6 w-6' />
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
                handleOpenModal(market.marketTokenAddress, 'buy')
              }}
            >
              Buy
            </Button>
            <Button
              size='sm'
              color='danger'
              onPress={() => {
                handleOpenModal(market.marketTokenAddress, 'sell')
              }}
            >
              Sell
            </Button>
          </div>
        )
      }
      return market[key] as React.ReactNode
    },
    [handleOpenModal],
  )

  const onSearchChange = useCallback((value: string | undefined) => {
    setFilterValue(value ?? '')
  }, [])

  const onSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
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
            onClear={() => {
              setFilterValue('')
            }}
            onValueChange={onSearchChange}
          />
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-small text-default-400'>
            Total {filteredMarkets.length} markets
          </span>
        </div>
      </div>
    )
  }, [filterValue, onSearchChange, filteredMarkets.length])

  return (
    <>
      <Table
        aria-label='Markets table'
        classNames={{
          base: ['max-w-7xl', 'm-auto'],
          th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
        }}
        sortDescriptor={sortDescriptor}
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
        <TableBody emptyContent={'No markets found'} items={sortedMarkets}>
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
    </>
  )
}
