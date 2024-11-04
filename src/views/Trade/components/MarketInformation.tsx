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

import {getTokenMetadata, getTokensMetadata, MOCK_SYMBOL_MAP} from '@/constants/tokens'
import HeadTags from '@/lib/head/HeadTags'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useMarketsData from '@/lib/trade/hooks/useMarketsData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import type {AvailableTokens} from '@/lib/trade/utils/market/getAvailableTokens'
import getAvailableTokens from '@/lib/trade/utils/market/getAvailableTokens'
import {getAvailableUsdLiquidityForPosition} from '@/lib/trade/utils/market/getAvailableUsdLiquidityForPosition'
import calculatePriceFractionDigits from '@/lib/trade/utils/price/calculatePriceFractionDigits'
import {ChartInterval} from '@/lib/tvchart/chartdata/ChartData'
import {getChartWssUrl} from '@/lib/tvchart/constants'
import {parseChartData} from '@/lib/tvchart/utils/binanceDataToChartData'
import max from '@/utils/numbers/bigint/max'
import min from '@/utils/numbers/bigint/min'
import expandDecimals, {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'

interface TokenOption {
  longLiquidity: bigint
  shortLiquidity: bigint
  marketTokenAddress: string
  indexTokenAddress: string
}

function use1DMarketInformation(symbol: string | undefined) {
  const [open, setOpen] = useState(0)
  const [close, setClose] = useState(0)
  const change = close - open
  const changePercent = change / open || 0
  const [high, setHigh] = useState(0)
  const [low, setLow] = useState(0)
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    if (!symbol) return

    const asset = MOCK_SYMBOL_MAP[symbol]

    if (!asset) return

    const wssUrl = getChartWssUrl(asset, ChartInterval['1d'])
    const chartDataWS = new WebSocket(wssUrl)

    const eventHandler = (event: MessageEvent<unknown>) => {
      if (typeof event.data !== 'string') {
        return
      }

      const rawData = JSON.parse(event.data)
      const data = parseChartData(rawData, ChartInterval['1d'])

      if (data) {
        setOpen(data.open)
        setClose(data.close)
        setHigh(data.high)
        setLow(data.low)
        setVolume(data.volume ?? 0)
      }
    }

    chartDataWS.addEventListener('message', eventHandler)

    return () => {
      chartDataWS.removeEventListener('message', eventHandler)
      chartDataWS.close()
    }
  }, [symbol])

  return {
    open,
    close,
    change,
    changePercent,
    high,
    low,
    volume,
  }
}

const TABLE_CLASS_NAMES = {
  th: '!rounded-none font-serif',
  td: 'first:before:rounded-none last:before:rounded-none',
  tbody: 'overflow-scroll',
}

const POPOVER_CLASS_NAMES = {
  content: 'max-w-[90vw] overflow-auto',
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

    const marketsWithLiquidity = allMarkets.map(marketInfo => {
      const longTokenPrice = tokenPricesData.get(marketInfo.longToken.address)?.max ?? 0n
      const shortTokenPrice = tokenPricesData.get(marketInfo.shortToken.address)?.max ?? 0n

      const longPoolAmountUsd =
        (longTokenPrice * marketInfo.longPoolAmount) /
        expandDecimals(1, marketInfo.longToken.decimals)
      const shortPoolAmountUsd =
        (shortTokenPrice * marketInfo.shortPoolAmount) /
        expandDecimals(1, marketInfo.shortToken.decimals)

      const longLiquidity = min(
        getAvailableUsdLiquidityForPosition(marketInfo, tokenPricesData, true),
        longPoolAmountUsd,
      )
      const shortLiquidity = min(
        getAvailableUsdLiquidityForPosition(marketInfo, tokenPricesData, false),
        shortPoolAmountUsd,
      )

      return {
        longLiquidity: longLiquidity > 0n ? longLiquidity : 0n,
        shortLiquidity: shortLiquidity > 0n ? shortLiquidity : 0n,
        marketTokenAddress: marketInfo.marketTokenAddress,
        indexTokenAddress: marketInfo.indexTokenAddress,
      }
    })
    const indexes: Record<string, TokenOption[]> = groupBy(
      marketsWithLiquidity,
      market => market.indexTokenAddress,
    )

    return new Map(Object.entries(indexes))
  }, [availableTokens?.allMarkets, tokenPricesData])

  const indexTokensWithLiquidityInformation = useMemo(() => {
    const indexes = new Map<
      string,
      {
        markets: TokenOption[]
        imageUrl: string
        maxLongLiquidity: number
        maxLongLiquidityString: string
        maxShortLiquidity: number
        maxShortLiquidityString: string
        price: number
        priceString: string
      }
    >()

    marketsWithLiquidityGrouppedByIndexToken.forEach((markets, token) => {
      const longLiquids = markets.map(data => data.longLiquidity)
      const shortLiquids = markets.map(data => data.shortLiquidity)

      const selectedLongLiquid = max(...longLiquids)
      const selectedShortLiquid = max(...shortLiquids)

      const price = tokenPricesData?.get(token)?.max ?? 0n
      const priceFractionDigits = calculatePriceFractionDigits(price)

      indexes.set(token, {
        markets,
        imageUrl: getTokenMetadata(chainId, token).imageUrl ?? '',
        maxLongLiquidity: Number(shrinkDecimals(selectedLongLiquid, USD_DECIMALS)),
        maxLongLiquidityString: formatNumber(
          shrinkDecimals(selectedLongLiquid, USD_DECIMALS),
          Format.USD,
          {exactFractionDigits: true, fractionDigits: 0},
        ),
        maxShortLiquidity: Number(shrinkDecimals(selectedShortLiquid, USD_DECIMALS)),
        maxShortLiquidityString: formatNumber(
          shrinkDecimals(selectedShortLiquid, USD_DECIMALS),
          Format.USD,
          {exactFractionDigits: true, fractionDigits: 0},
        ),
        price: Number(shrinkDecimals(price, USD_DECIMALS)),
        priceString: formatNumber(shrinkDecimals(price, USD_DECIMALS), Format.USD, {
          exactFractionDigits: true,
          fractionDigits: priceFractionDigits,
        }),
      })
    })

    return indexes
  }, [marketsWithLiquidityGrouppedByIndexToken, chainId, tokenPricesData])

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

  const {change, changePercent, high, low, volume} = use1DMarketInformation(tokenMetadata?.symbol)

  const priceIndex = tokenPricesData && tokenAddress ? tokenPricesData.get(tokenAddress)?.max : 0n
  const priceMark = tokenPricesData && tokenAddress ? tokenPricesData.get(tokenAddress)?.min : 0n

  const priceFractionDigits = calculatePriceFractionDigits(priceIndex)

  const priceIndexText = priceIndex
    ? formatNumber(shrinkDecimals(priceIndex, USD_DECIMALS), Format.USD, {
        exactFractionDigits: true,
        fractionDigits: priceFractionDigits,
      })
    : '--'
  const priceMarkText = priceMark
    ? formatNumber(shrinkDecimals(priceMark, USD_DECIMALS), Format.USD, {
        exactFractionDigits: true,
        fractionDigits: priceFractionDigits,
      })
    : '--'

  const maxLongLiquidityText =
    indexTokensWithLiquidityInformationList.find(
      item => item.markets[0]?.indexTokenAddress === tokenAddress,
    )?.maxLongLiquidityString ?? '--'

  const maxShortLiquidityText =
    indexTokensWithLiquidityInformationList.find(
      item => item.markets[0]?.indexTokenAddress === tokenAddress,
    )?.maxShortLiquidityString ?? '--'

  const handleOnMarketTableOpenChange = useCallback(
    (open: boolean) => {
      setMarketSelectorIsOpen(open)
    },
    [setMarketSelectorIsOpen],
  )

  const selectedMarketKeys = useMemo(() => {
    return tokenAddress ? [tokenAddress] : []
  }, [tokenAddress])

  return (
    <>
      {tokenMetadata?.symbol && priceIndexText && (
        <HeadTags title={`${priceIndexText} | ${tokenMetadata.symbol}/USD`} />
      )}
      <Card>
        <CardBody className='flex flex-row items-center gap-4'>
          <Popover
            placement='bottom-start'
            offset={6}
            backdrop='opaque'
            isOpen={marketSelectorIsOpen}
            onOpenChange={handleOnMarketTableOpenChange}
            classNames={POPOVER_CLASS_NAMES}
          >
            <PopoverTrigger>
              <Button
                className='min-w-fit text-nowrap p-4 text-2xl font-medium'
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
                aria-label='Markets'
                className='my-2'
                classNames={TABLE_CLASS_NAMES}
                removeWrapper
                selectionMode='single'
                selectedKeys={selectedMarketKeys}
                onSelectionChange={handleSelectMarket}
                sortDescriptor={marketSortDescriptor}
                onSortChange={handleSortChange}
              >
                <TableHeader>
                  <TableColumn allowsSorting>Pair</TableColumn>
                  <TableColumn allowsSorting>Price</TableColumn>
                  <TableColumn allowsSorting>Long Liq.</TableColumn>
                  <TableColumn allowsSorting>Short Liq.</TableColumn>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredIndexTokens.map(item => {
                    return (
                      <TableRow key={item.address} className='cursor-pointer'>
                        <TableCell>
                          <div className='flex min-w-max items-center gap-2 text-nowrap'>
                            <img
                              src={item.imageUrl}
                              alt={item.symbol}
                              className='h-6 w-6 rounded'
                            />
                            <span>{`${item.symbol}/USD`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{item.priceString}</span>
                        </TableCell>
                        <TableCell>
                          <span>{item.maxLongLiquidityString}</span>
                        </TableCell>
                        <TableCell>
                          <span>{item.maxShortLiquidityString}</span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </PopoverContent>
          </Popover>
          <div className='flex flex-1 flex-row gap-4'>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-2xl leading-6'>{priceIndexText}</div>
              <div className='text-nowrap text-xs opacity-70'>{priceMarkText}</div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>Long Liq.</div>
              <div className='text-sm'>{maxLongLiquidityText}</div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>Short Liq.</div>
              <div className='text-sm'>{maxShortLiquidityText}</div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>24h Chg.</div>
              <div className='text-sm'>
                <span className={change > 0 ? 'text-success' : 'text-danger'}>
                  {formatNumber(changePercent, Format.PERCENT_SIGNED)}
                </span>
              </div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>24h High/Low</div>
              <div className='text-nowrap text-sm'>
                <span className='text-success'>${high}</span>/
                <span className='text-danger'>${low}</span>
              </div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>24h Vol.</div>
              <div className='text-nowrap text-sm'>
                {formatNumber(volume, Format.USD_ABBREVIATED)}
              </div>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <div className='text-nowrap text-xs opacity-70'>Open Interest</div>
              <div className='mt-0.5 flex overflow-hidden text-xs'>
                <div className='bg-success px-1 py-0.5 text-white'>51.45%</div>
                <div className='bg-danger px-1 py-0.5 text-white'>48.55%</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  )
})
