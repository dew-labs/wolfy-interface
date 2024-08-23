import {
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
  type SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import type {Selection} from '@react-types/shared'
import {memo, useCallback, useEffect, useMemo, useState} from 'react'
import {groupBy} from 'remeda'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import type {AvailableTokens} from '@/lib/trade/utils/market/getAvailableTokens'
import getAvailableTokens from '@/lib/trade/utils/market/getAvailableTokens'
import {getAvailableUsdLiquidityForPosition} from '@/lib/trade/utils/market/getAvailableUsdLiquidityForPosition'
import max from '@/utils/numbers/bigint/max'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatLocaleNumber from '@/utils/numbers/formatLocaleNumber'

interface TokenOption {
  longLiquidity: bigint
  shortLiquidity: bigint
  marketTokenAddress: string
  indexTokenAddress: string
}

export default memo(function MarketInformation() {
  const [chainId] = useChainId()
  const [tokenAddress, setTokenAddress] = useTokenAddress()
  const tokensMetadata = getTokensMetadata(chainId)
  const tokenPricesData = useTokenPrices(data => data)
  const [marketSortDescriptor, setMarketSortDescriptor] = useState<SortDescriptor>({})

  const marketsData = useMarketsData()

  const dataIsLoaded = !!marketsData && !!tokenPricesData

  const availableTokens: AvailableTokens | undefined = useMemo(() => {
    if (marketsData && tokenPricesData) {
      return getAvailableTokens(marketsData, tokenPricesData)
    }
  }, [marketsData, tokenPricesData])

  const marketsWithLiquidityGrouppedByIndexToken = useMemo(() => {
    if (!tokenPricesData || !availableTokens?.allMarkets) return new Map<string, TokenOption[]>()

    const allMarkets = Array.from(availableTokens.allMarkets)

    const marketsWithMaxReservedUsd = allMarkets.map(marketInfo => {
      const longLiquidity = getAvailableUsdLiquidityForPosition(marketInfo, tokenPricesData, true)
      const shortLiquidity = getAvailableUsdLiquidityForPosition(marketInfo, tokenPricesData, false)

      return {
        longLiquidity: longLiquidity > 0n ? longLiquidity : 0n,
        shortLiquidity: shortLiquidity > 0n ? shortLiquidity : 0n,
        marketTokenAddress: marketInfo.marketTokenAddress,
        indexTokenAddress: marketInfo.indexTokenAddress,
      }
    })
    const indexes: Record<string, TokenOption[]> = groupBy(
      marketsWithMaxReservedUsd,
      market => market.indexTokenAddress,
    )

    return new Map(Object.entries(indexes))
  }, [availableTokens?.allMarkets, tokenPricesData])

  const indexTokensWithLiquidityInformation = useMemo(() => {
    const indexes = new Map<
      string,
      {
        markets: TokenOption[]
        maxLongLiquidity: bigint
        maxShortLiquidity: bigint
      }
    >()

    marketsWithLiquidityGrouppedByIndexToken.forEach((markets, token) => {
      const longLiquids = markets.map(data => data.longLiquidity)
      const shortLiquids = markets.map(data => data.shortLiquidity)

      indexes.set(token, {
        markets,
        maxLongLiquidity: max(...longLiquids) / expandDecimals(1, USD_DECIMALS),
        maxShortLiquidity: max(...shortLiquids) / expandDecimals(1, USD_DECIMALS),
      })
    })

    return indexes
  }, [marketsWithLiquidityGrouppedByIndexToken])

  const indexTokensWithLiquidityInformationList = useMemo(
    () => Array.from(indexTokensWithLiquidityInformation.values()),
    [indexTokensWithLiquidityInformation],
  )

  const sortedAndFilteredIndexTokens = useMemo(() => {
    const sortedAndFilteredIndexTokens = indexTokensWithLiquidityInformationList
      .map(index => {
        const indexTokenAddress = index.markets[0]?.indexTokenAddress
        if (!indexTokenAddress) return false

        const symbol = tokensMetadata.get(indexTokenAddress)?.symbol

        if (!symbol) return false
        return {
          symbol,
          address: indexTokenAddress,
          ...index,
        }
      })
      .filter(Boolean)

    sortedAndFilteredIndexTokens.sort((a, b) => {
      const column = (() => {
        switch (marketSortDescriptor.column) {
          case '$.0':
            return 'symbol'
          case '$.1':
            return 'maxLongLiquidity'
          case '$.2':
            return 'maxShortLiquidity'
          default:
            return 'symbol'
        }
      })()

      const aValue = a[column]
      const bValue = b[column]

      if (marketSortDescriptor.direction === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue > bValue ? -1 : 1
      }
      return 0
    })

    return sortedAndFilteredIndexTokens
  }, [indexTokensWithLiquidityInformationList, marketSortDescriptor, tokensMetadata])

  const indexTokenAddressList = useMemo(
    () => indexTokensWithLiquidityInformationList.map(i => i.markets[0]?.indexTokenAddress),
    [indexTokensWithLiquidityInformationList],
  )

  useEffect(() => {
    if (
      (!tokenAddress || (dataIsLoaded && !indexTokenAddressList.includes(tokenAddress))) &&
      indexTokenAddressList[0]
    ) {
      setTokenAddress(indexTokenAddressList[0])
    }
  }, [dataIsLoaded, indexTokenAddressList, setTokenAddress, tokenAddress])

  const tokenMetadata = tokenAddress ? tokensMetadata.get(tokenAddress) : undefined

  const [marketSelectorIsOpen, setMarketSelectorIsOpen] = useState(false)

  const handleSortChange = useCallback((descriptor: SortDescriptor) => {
    setMarketSortDescriptor(descriptor)
  }, [])

  const handleSelectMarket = useCallback(
    (selection: Selection) => {
      if (selection === 'all') return
      const selected = Array.from(selection.keys())
      if (selected.length === 0) return
      const selectedKey = selected[0]
      if (typeof selectedKey !== 'string') return
      setTokenAddress(selectedKey)
      setMarketSelectorIsOpen(false)
    },
    [setTokenAddress],
  )

  const priceIndex = tokenPricesData && tokenAddress && tokenPricesData.get(tokenAddress)?.max
  const priceMark = tokenPricesData && tokenAddress && tokenPricesData.get(tokenAddress)?.min

  const priceIndexText = priceIndex ? shrinkDecimals(priceIndex, USD_DECIMALS, 2, true, true) : '--'
  const priceMarkText = priceMark ? shrinkDecimals(priceMark, USD_DECIMALS, 2, true, true) : '--'

  return (
    <Card>
      <CardBody className='flex flex-row items-center gap-6'>
        <Popover
          placement='bottom-start'
          offset={6}
          backdrop='opaque'
          isOpen={marketSelectorIsOpen}
          onOpenChange={open => {
            setMarketSelectorIsOpen(open)
          }}
        >
          <PopoverTrigger>
            <Button
              className='text-2xl font-medium'
              size='lg'
              variant='flat'
              startContent={
                tokenMetadata ? (
                  <img className='rounded' src={tokenMetadata.imageUrl} width='24' alt='' />
                ) : (
                  '--'
                )
              }
            >
              {tokenMetadata ? tokenMetadata.symbol : '--'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Table
              aria-label='Example static collection table'
              className='my-2'
              removeWrapper
              selectionMode='single'
              selectedKeys={tokenAddress ? [tokenAddress] : []}
              onSelectionChange={handleSelectMarket}
              sortDescriptor={marketSortDescriptor}
              onSortChange={handleSortChange}
            >
              <TableHeader>
                <TableColumn allowsSorting>Pair</TableColumn>
                <TableColumn allowsSorting>Long Liq.</TableColumn>
                <TableColumn allowsSorting>Short Liq.</TableColumn>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredIndexTokens.map(item => {
                  return (
                    <TableRow key={item.address} className='cursor-pointer'>
                      <TableCell>{`${item.symbol} / USD`}</TableCell>
                      <TableCell>${formatLocaleNumber(item.maxLongLiquidity)}</TableCell>
                      <TableCell>${formatLocaleNumber(item.maxShortLiquidity)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </PopoverContent>
        </Popover>
        <div className='flex flex-1 flex-row gap-4'>
          <div className='flex flex-col items-start justify-center'>
            <div className='text-2xl leading-6'>${priceIndexText}</div>
            <div className='text-xs opacity-70'>${priceMarkText}</div>
          </div>
          <div className='flex flex-col items-start justify-center'>
            <div className='text-xs opacity-70'>24h Change</div>
            <div className='text-lg'>-1.26%</div>
          </div>
          <div className='flex flex-col items-start justify-center'>
            <div className='text-xs opacity-70'>24h High</div>
            <div className='text-lg'>3,215.58</div>
          </div>
          <div className='flex flex-col items-start justify-center'>
            <div className='text-xs opacity-70'>24h Low</div>
            <div className='text-lg'>3,077.70</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
})
