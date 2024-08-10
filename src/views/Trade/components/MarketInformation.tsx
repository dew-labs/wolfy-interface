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
import {type QueryClient, queryOptions, useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo, useState} from 'react'
import {groupBy} from 'remeda'

import type {StarknetChainId} from '@/constants/chains'
import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useWalletAccount from '@/lib/starknet/hooks/useWalletAccount'
import fetchMarkets, {type Market} from '@/lib/trade/services/fetchMarkets'
import fetchMarketsData, {type MarketsData} from '@/lib/trade/services/fetchMarketsData'
import fetchTokensData, {type TokensData} from '@/lib/trade/services/fetchTokensData'
import useToken from '@/lib/trade/states/useToken'
import type {AvailableTokens} from '@/lib/trade/utils/getAvailableTokens'
import getAvailableTokens from '@/lib/trade/utils/getAvailableTokens'
import {getAvailableUsdLiquidityForPosition} from '@/lib/trade/utils/getAvailableUsdLiquidityForPosition'
import max from '@/utils/numbers/bigint/max'
import formatLocaleNumber from '@/utils/numbers/formatLocaleNumber'
import roundToNDecimalPlaces from '@/utils/numbers/roundToNDecimalPlaces'
import {NO_REFETCH_OPTIONS} from '@/utils/query/constants'

function createGetMarketsDataQueryOptions(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
  queryClient: QueryClient,
) {
  return queryOptions({
    queryKey: ['markets', chainId, accountAddress] as const,
    queryFn: async ({queryKey}) => {
      let markets = queryClient.getQueryData(['markets', queryKey[1]])
      if (!markets) {
        markets = await queryClient.fetchQuery({
          queryKey: ['markets', queryKey[1]],
        })
      }

      let tokensData = queryClient.getQueryData(['tokens', queryKey[1], accountAddress])
      if (!tokensData) {
        tokensData = await queryClient.fetchQuery({
          queryKey: ['tokens', queryKey[1], queryKey[2]],
        })
      }

      if (!markets || !tokensData) {
        return new Map() as MarketsData
      }

      return await fetchMarketsData(
        queryKey[1],
        markets as Market[],
        tokensData as TokensData,
        queryKey[2],
      )
    },
    ...NO_REFETCH_OPTIONS,
  })
}

function createGetMarketsQueryOptions(chainId: StarknetChainId) {
  return queryOptions({
    queryKey: ['markets', chainId] as const,
    queryFn: async ({queryKey}) => {
      return await fetchMarkets(queryKey[1])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

function createGetTokensQueryOptions(chainId: StarknetChainId, accountAddress: string | undefined) {
  return queryOptions({
    queryKey: ['tokens', chainId, accountAddress] as const,
    queryFn: async ({queryKey}) => {
      return await fetchTokensData(queryKey[1], queryKey[2])
    },
    ...NO_REFETCH_OPTIONS,
  })
}

interface TokenOption {
  longLiquidity: bigint
  shortLiquidity: bigint
  marketTokenAddress: string
  indexTokenAddress: string
}

export default function MarketInformation() {
  const [chainId] = useChainId()
  const [walletAccount] = useWalletAccount()
  const [selectedToken, setSelectedToken] = useToken()
  const accountAddress = walletAccount?.address
  const tokensMetadata = getTokensMetadata(chainId)
  const queryClient = useQueryClient()

  useQuery(createGetMarketsQueryOptions(chainId))
  useQuery(createGetTokensQueryOptions(chainId, accountAddress))

  const {data: marketsData} = useQuery(
    createGetMarketsDataQueryOptions(chainId, accountAddress, queryClient),
  )
  const [marketSortDescriptor, setMarketSortDescriptor] = useState<SortDescriptor>({})

  let availableTokens: AvailableTokens | undefined = undefined
  if (marketsData) {
    availableTokens = getAvailableTokens(marketsData)
  }

  const marketsWithLiquidityGrouppedByIndexToken = useMemo(() => {
    const allMarkets = availableTokens?.allMarkets ? Array.from(availableTokens.allMarkets) : []
    const marketsWithMaxReservedUsd = allMarkets.map(marketInfo => {
      const longLiquidity = getAvailableUsdLiquidityForPosition(marketInfo, true)
      const shortLiquidity = getAvailableUsdLiquidityForPosition(marketInfo, false)

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
  }, [availableTokens?.allMarkets])

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
        maxLongLiquidity: max(...longLiquids),
        maxShortLiquidity: max(...shortLiquids),
      })
    })

    return indexes
  }, [marketsWithLiquidityGrouppedByIndexToken])

  const sortedAndFilteredIndexTokens = useMemo(() => {
    const sortedAndFilteredIndexTokens = Array.from(indexTokensWithLiquidityInformation.values())
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
  }, [indexTokensWithLiquidityInformation, marketSortDescriptor, tokensMetadata])

  if (!selectedToken && sortedAndFilteredIndexTokens[0]?.address) {
    setSelectedToken(sortedAndFilteredIndexTokens[0].address)
  }

  const tokenMetadata = selectedToken ? tokensMetadata.get(selectedToken) : undefined

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
      console.log('selectedKey', selectedKey)
      setSelectedToken(selectedKey)
      setMarketSelectorIsOpen(false)
    },
    [setSelectedToken],
  )

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
              selectedKeys={selectedToken ? [selectedToken] : []}
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
                      <TableCell>
                        ${formatLocaleNumber(roundToNDecimalPlaces(item.maxLongLiquidity))}
                      </TableCell>
                      <TableCell>
                        ${formatLocaleNumber(roundToNDecimalPlaces(item.maxShortLiquidity))}
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
            <div className='text-2xl leading-6'>$3,145.20</div>
            <div className='text-xs opacity-70'>$3,145.20</div>
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
}
